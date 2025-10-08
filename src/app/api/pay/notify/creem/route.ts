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

    // 区分首次订阅和续订：如果 sub_times 为 null 或 0，说明是首次订阅，已经在 checkout.completed 中处理过了
    const currentSubTimes = order.sub_times || 0;
    if (currentSubTimes === 0) {
      console.log(
        "Skipping first subscription payment (handled by checkout.completed)"
      );
      return;
    }

    console.log(
      `✅ This is a subscription renewal (sub_times: ${currentSubTimes})`
    );

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

    // 续订次数 +1
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
