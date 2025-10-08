import { updateOrder } from "@/services/order";
import { respOk } from "@/lib/resp";
import { updateOrderSubscription, findOrderByOrderNo } from "@/models/order";
import { increaseCredits, CreditsTransType } from "@/services/credit";
import { getIsoTimestr } from "@/lib/time";

export async function POST(req: Request) {
  try {
    const creemWebhookSecret = process.env.CREEM_WEBHOOK_SECRET;

    if (!creemWebhookSecret) {
      throw new Error("invalid creem config");
    }

    const sign = req.headers.get("creem-signature") as string;
    const body = await req.text();
    if (!sign || !body) {
      throw new Error("invalid notify data");
    }

    const computedSignature = await generateSignature(body, creemWebhookSecret);

    if (computedSignature !== sign) {
      throw new Error("invalid signature");
    }

    const event = JSON.parse(body);

    console.log("creen notify event: ", JSON.stringify(event));

    switch (event.eventType) {
      case "checkout.completed": {
        const session = event.object;

        if (
          !session ||
          !session.metadata ||
          !session.metadata.order_no ||
          !session.order ||
          session.order.status !== "paid"
        ) {
          throw new Error("invalid session");
        }

        const order_no = session.metadata.order_no;
        const paid_email = session.customer?.email || "";
        const paid_detail = JSON.stringify(session);

        await updateOrder({ order_no, paid_email, paid_detail });

        // 如果是订阅订单，初始化订阅信息
        if (session.subscription?.id) {
          console.log(
            `Initializing subscription info for order ${order_no}, subscription: ${session.subscription.id}`
          );

          // 获取订阅详细信息（从 metadata 或从 subscription 对象）
          const subscriptionId = session.subscription.id;
          const paid_at = getIsoTimestr();

          // 注意：checkout.completed 中的 session 对象可能没有完整的订阅信息
          // 我们只初始化基本的 sub_id 和 sub_times
          // 详细信息会在 subscription.paid 事件中更新
          await updateOrderSubscription(
            order_no,
            subscriptionId,
            1, // interval_count 默认为 1
            0, // cycle_anchor，暂时设为 0，会在 subscription.paid 中更新
            0, // period_end，暂时设为 0，会在 subscription.paid 中更新
            0, // period_start，暂时设为 0，会在 subscription.paid 中更新
            "paid",
            paid_at,
            1, // 首次订阅，sub_times = 1
            paid_email,
            paid_detail
          );

          console.log(
            `Subscription info initialized for ${order_no}, sub_id: ${subscriptionId}`
          );
        }
        break;
      }

      case "subscription.paid": {
        const subscription = event.object;

        if (!subscription || !subscription.metadata) {
          console.log("subscription.paid: invalid subscription data, skipping");
          break;
        }

        await handleSubscriptionRenewal(subscription);
        break;
      }

      case "subscription.active": {
        const subscription = event.object;
        await handleSubscriptionActive(subscription);
        break;
      }

      case "subscription.canceled": {
        const subscription = event.object;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case "subscription.expired": {
        const subscription = event.object;
        await handleSubscriptionExpired(subscription);
        break;
      }

      default:
        console.log("not handle event: ", event.eventType);
    }

    return respOk();
  } catch (e: any) {
    console.log("creem notify failed: ", e);
    return Response.json(
      { error: `handle creem notify failed: ${e.message}` },
      { status: 500 }
    );
  }
}

async function handleSubscriptionRenewal(subscription: any) {
  try {
    console.log(
      "Processing subscription renewal:",
      subscription.id,
      "status:",
      subscription.status
    );

    const { order_no, user_uuid, credits, user_email } =
      extractMetadataFromSubscription(subscription);

    if (!order_no || !user_uuid || !credits) {
      console.log("Missing required metadata:", {
        order_no,
        user_uuid,
        credits,
      });
      return;
    }

    const creditsAmount = parseInt(credits);
    if (isNaN(creditsAmount) || creditsAmount <= 0) {
      console.log("Invalid credits amount:", credits);
      return;
    }

    const order = await findOrderByOrderNo(order_no);
    if (!order) {
      console.log("Original order not found:", order_no);
      return;
    }

    // 区分首次订阅和续订：通过比较订阅创建时间和当前周期开始时间
    const subscriptionCreatedAt = new Date(subscription.created_at);
    const currentPeriodStart = new Date(subscription.current_period_start_date);
    const timeDiff = Math.abs(
      currentPeriodStart.getTime() - subscriptionCreatedAt.getTime()
    );

    // 如果时间差小于 1 小时，认为是首次订阅（由 checkout.completed 处理）
    const isFirstSubscription = timeDiff < 3600000; // 1小时 = 3600000毫秒

    if (isFirstSubscription) {
      console.log(
        `Skipping first subscription payment (time diff: ${Math.round(timeDiff / 1000)}s, handled by checkout.completed)`
      );

      // 防御性逻辑：如果 checkout.completed 还没来得及初始化订阅信息，这里先初始化
      if (!order.sub_id) {
        console.log("Initializing subscription info for first payment");
        const paid_at = getIsoTimestr();
        const paid_email = subscription.customer?.email || user_email || "";
        const paid_detail = JSON.stringify(subscription);
        const period_start = Math.floor(subscriptionCreatedAt.getTime() / 1000);
        const period_end = Math.floor(new Date(subscription.current_period_end_date).getTime() / 1000);

        await updateOrderSubscription(
          order_no,
          subscription.id,
          1,
          period_start,
          period_end,
          period_start,
          "paid",
          paid_at,
          1, // 首次订阅，sub_times = 1
          paid_email,
          paid_detail
        );
        console.log("Subscription info initialized");
      }
      return;
    }

    console.log(
      `✅ This is a subscription renewal (time diff: ${Math.round(timeDiff / 1000 / 86400)}days, created: ${subscriptionCreatedAt.toISOString()}, period_start: ${currentPeriodStart.toISOString()})`
    );

    // 获取当前的续订次数，如果为空则设为 1（兼容老数据）
    const currentSubTimes = order.sub_id ? (order.sub_times || 1) : 0;

    // 防御性逻辑：如果续订时发现订单没有 sub_id，说明是老数据或 checkout.completed 没有正确处理
    if (!order.sub_id) {
      console.warn(
        `⚠️ Renewal detected but order has no sub_id, initializing subscription info first`
      );
    }

    // 设置积分过期时间为当前周期结束时间
    const periodEndDate = new Date(subscription.current_period_end_date);
    const creditsExpiry = periodEndDate;

    await increaseCredits({
      user_uuid: user_uuid,
      trans_type: CreditsTransType.OrderPay,
      credits: creditsAmount,
      expired_at: creditsExpiry.toISOString(),
      order_no: order_no,
    });

    const paid_at = getIsoTimestr();
    const paid_email = subscription.customer?.email || user_email || "";
    const paid_detail = JSON.stringify(subscription);

    // 转换日期为时间戳（秒）
    const period_start = Math.floor(
      new Date(subscription.current_period_start_date).getTime() / 1000
    );
    const period_end = Math.floor(
      new Date(subscription.current_period_end_date).getTime() / 1000
    );

    // 续订次数 +1（如果是老数据第一次续订，从 1 开始）
    const newSubTimes = currentSubTimes + 1;

    await updateOrderSubscription(
      order_no,
      subscription.id,
      1, // interval_count，Creem 默认为 1
      period_start, // cycle_anchor
      period_end, // period_end
      period_start, // period_start
      "paid",
      paid_at,
      newSubTimes,
      paid_email,
      paid_detail
    );

    console.log(
      `Subscription renewal processed successfully for user ${user_uuid}, added ${creditsAmount} credits, expiry: ${creditsExpiry.toISOString()}, renewal count: ${newSubTimes}`
    );
  } catch (error) {
    console.error("Failed to handle subscription renewal:", error);
    throw error;
  }
}

async function handleSubscriptionActive(subscription: any) {
  try {
    console.log("Processing subscription activation:", subscription.id);

    const { order_no, user_uuid } = extractMetadataFromSubscription(subscription);

    if (order_no && user_uuid) {
      console.log(
        `Subscription ${subscription.id} activated for user ${user_uuid}, order ${order_no}`
      );
      console.log(`Subscription status: ${subscription.status}`);
    } else {
      console.warn(
        `Subscription ${subscription.id} activated but missing metadata:`,
        { order_no, user_uuid }
      );
    }
  } catch (error) {
    console.error("Failed to handle subscription activation:", error);
  }
}

async function handleSubscriptionCanceled(subscription: any) {
  try {
    console.log("Processing subscription cancellation:", subscription.id);

    const { order_no, user_uuid } = extractMetadataFromSubscription(subscription);
    const canceledAt = subscription.canceled_at
      ? new Date(subscription.canceled_at)
      : new Date();

    if (order_no && user_uuid) {
      console.log(
        `Subscription ${subscription.id} canceled for user ${user_uuid}, order ${order_no}`
      );
      console.log(`Cancellation date: ${canceledAt.toISOString()}`);

      console.log(
        `User ${user_uuid} has lost subscription access - consider sending notification email`
      );
    } else {
      console.warn(
        `Subscription ${subscription.id} canceled but missing metadata:`,
        { order_no, user_uuid }
      );
    }
  } catch (error) {
    console.error("Failed to handle subscription cancellation:", error);
  }
}

async function handleSubscriptionExpired(subscription: any) {
  try {
    console.log("Processing subscription expiration:", subscription.id);

    const { order_no, user_uuid } = extractMetadataFromSubscription(subscription);

    if (order_no && user_uuid) {
      console.log(
        `Subscription ${subscription.id} expired for user ${user_uuid}, order ${order_no}`
      );
      console.log(`Subscription status: ${subscription.status}`);

      console.log(
        `User ${user_uuid} subscription has expired - consider sending renewal reminder`
      );
    } else {
      console.warn(
        `Subscription ${subscription.id} expired but missing metadata:`,
        { order_no, user_uuid }
      );
    }
  } catch (error) {
    console.error("Failed to handle subscription expiration:", error);
  }
}

function extractMetadataFromSubscription(subscription: any): {
  order_no?: string;
  user_uuid?: string;
  credits?: string;
  user_email?: string;
} {
  const metadata = subscription?.metadata || {};

  return {
    order_no: metadata.order_no,
    user_uuid: metadata.user_uuid,
    credits: metadata.credits,
    user_email: metadata.user_email || subscription?.customer?.email,
  };
}

async function generateSignature(
  payload: string,
  secret: string
): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(payload);

    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", key, messageData);

    const signatureArray = new Uint8Array(signature);
    return Array.from(signatureArray)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch (error: any) {
    throw new Error(`Failed to generate signature: ${error.message}`);
  }
}
