import {
  findCreditByOrderNo,
  getUserValidCredits,
  insertCredit,
} from "@/models/credit";
import { credits as creditsTable } from "@/db/schema";
import { db } from "@/db";
import { and, eq, desc } from "drizzle-orm";
import { getIsoTimestr } from "@/lib/time";
import { getSnowId } from "@/lib/hash";
import { Order } from "@/types/order";
import { UserCredits } from "@/types/user";
import { getFirstPaidOrderByUserUuid } from "@/models/order";

export enum CreditsTransType {
  NewUser = "new_user", // initial credits for new user
  OrderPay = "order_pay", // user pay for credits
  SystemAdd = "system_add", // system add credits
  Ping = "ping", // cost for ping api
  FluxGenerate = "flux_generate", // cost for flux image generation
  FluxEdit = "flux_edit", // cost for flux image editing
  NanoBanana_generate = "NanoBanana_generate", // cost for nano banana text-to-image
  NanoBanana_edit = "NanoBanana_edit", // cost for nano banana image-to-image
  NanoBanana_refund = "NanoBanana_refund", // refund for failed nano banana tasks
  Upscaler_submit = "upscaler_submit", // cost for upscaler image processing
  Upscaler_refund = "upscaler_refund", // refund for failed upscaler tasks
  Veo3_fast = "veo3_fast", // cost for veo3_fast video generation
  Veo3_quality = "veo3_quality", // cost for veo3 high quality video generation
  Veo3_1080p = "veo3_1080p", // cost for upgrading to 1080P video
  Veo3_refund = "veo3_refund", // refund for failed veo3 tasks
  Sora2 = "sora2", // cost for sora 2 video generation
  Sora2_refund = "sora2_refund", // refund for failed sora 2 tasks
}

export enum CreditsAmount {
  NewUserGet = 10,
  PingCost = 1,
  FluxProCost = 2,
  FluxMaxCost = 4,
  NanoBananaPerImage = 4, // cost per image for nano banana
}

export async function getUserCredits(user_uuid: string): Promise<UserCredits> {
  let user_credits: UserCredits = {
    left_credits: 0,
  };

  try {
    const first_paid_order = await getFirstPaidOrderByUserUuid(user_uuid);
    if (first_paid_order) {
      user_credits.is_recharged = true;
    }

    const credits = await getUserValidCredits(user_uuid);
    if (credits) {
      credits.forEach((v) => {
        user_credits.left_credits += v.credits || 0;
      });
    }

    if (user_credits.left_credits < 0) {
      user_credits.left_credits = 0;
    }

    if (user_credits.left_credits > 0) {
      user_credits.is_pro = true;
    }

    return user_credits;
  } catch (e) {
    console.log("get user credits failed: ", e);
    return user_credits;
  }
}

export async function checkUserCredits(
  user_uuid: string,
  requiredCredits: number
): Promise<{ hasEnough: boolean; currentCredits: number }> {
  try {
    const userCredits = await getUserCredits(user_uuid);
    return {
      hasEnough: userCredits.left_credits >= requiredCredits,
      currentCredits: userCredits.left_credits,
    };
  } catch (e) {
    console.log("check user credits failed: ", e);
    return {
      hasEnough: false,
      currentCredits: 0,
    };
  }
}

export async function decreaseCredits({
  user_uuid,
  trans_type,
  credits,
}: {
  user_uuid: string;
  trans_type: CreditsTransType;
  credits: number;
}) {
  try {
    let order_no = "";
    let expired_at = "";
    let left_credits = 0;

    const userCredits = await getUserValidCredits(user_uuid);
    if (userCredits) {
      for (let i = 0, l = userCredits.length; i < l; i++) {
        const credit = userCredits[i];
        left_credits += credit.credits;

        // credit enough for cost
        if (left_credits >= credits) {
          order_no = credit.order_no || "";
          expired_at = credit.expired_at?.toISOString() || "";
          break;
        }

        // look for next credit
      }
    }

    const new_credit: typeof creditsTable.$inferInsert = {
      trans_no: getSnowId(),
      created_at: new Date(getIsoTimestr()),
      expired_at: new Date(expired_at),
      user_uuid: user_uuid,
      trans_type: trans_type,
      credits: 0 - credits,
      order_no: order_no,
    };
    await insertCredit(new_credit);
  } catch (e) {
    console.log("decrease credits failed: ", e);
    throw e;
  }
}

export async function increaseCredits({
  user_uuid,
  trans_type,
  credits,
  expired_at,
  order_no,
}: {
  user_uuid: string;
  trans_type: string;
  credits: number;
  expired_at?: string;
  order_no?: string;
}) {
  try {
    const new_credit: typeof creditsTable.$inferInsert = {
      trans_no: getSnowId(),
      created_at: new Date(getIsoTimestr()),
      user_uuid: user_uuid,
      trans_type: trans_type,
      credits: credits,
      order_no: order_no || "",
      expired_at: expired_at ? new Date(expired_at) : null,
    };
    await insertCredit(new_credit);
  } catch (e) {
    console.log("increase credits failed: ", e);
    throw e;
  }
}

export async function updateCreditForOrder(order: Order) {
  try {
    const credit = await findCreditByOrderNo(order.order_no);
    if (credit) {
      // order already increased credit
      return;
    }

    await increaseCredits({
      user_uuid: order.user_uuid,
      trans_type: CreditsTransType.OrderPay,
      credits: order.credits,
      expired_at: order.expired_at,
      order_no: order.order_no,
    });
  } catch (e) {
    console.log("update credit for order failed: ", e);
    throw e;
  }
}

// 通用的智能退款函数
export async function refundCreditsWithOriginalExpiry({
  userUuid,
  amount,
  refundTransType,
  consumptionTransType,
  taskId,
}: {
  userUuid: string;
  amount: number;
  refundTransType: CreditsTransType;
  consumptionTransType: CreditsTransType;
  taskId?: string;
}): Promise<{ success: boolean; expiredAt?: Date; orderNo?: string }> {
  try {
    // 查找对应的消费记录
    const consumptionRecord = await findConsumptionRecordByType(
      userUuid,
      amount,
      consumptionTransType
    );

    // 确定退款积分的有效期和订单号
    let expiredAt: Date;
    let originalOrderNo = "";

    if (consumptionRecord && consumptionRecord.expired_at) {
      // 使用原积分的有效期
      expiredAt = new Date(consumptionRecord.expired_at);
      originalOrderNo = consumptionRecord.order_no;
      console.log(`Using original credit expiry: ${expiredAt}, order: ${originalOrderNo}`);
    } else {
      // fallback: 查找用户最新的有效积分过期时间
      const validCredits = await getUserValidCredits(userUuid);
      if (validCredits && validCredits.length > 0) {
        expiredAt = validCredits[0].expired_at ? new Date(validCredits[0].expired_at) : new Date();
        originalOrderNo = validCredits[0].order_no || "";
        console.log(`Using latest valid credit expiry: ${expiredAt}`);
      } else {
        // 最终fallback: 默认1年有效期
        expiredAt = new Date();
        expiredAt.setFullYear(expiredAt.getFullYear() + 1);
        console.log(`Using fallback 1-year expiry: ${expiredAt}`);
      }
    }

    // 增加退款积分，保持原有效期和订单关联
    await increaseCredits({
      user_uuid: userUuid,
      trans_type: refundTransType,
      credits: amount,
      expired_at: expiredAt.toISOString(),
      order_no: originalOrderNo, // 记录原订单号
    });

    console.log(`Refunded ${amount} credits for user ${userUuid} with expiry: ${expiredAt}, order: ${originalOrderNo || 'unknown'}`);

    return {
      success: true,
      expiredAt,
      orderNo: originalOrderNo,
    };
  } catch (error) {
    console.error(`Failed to refund credits for user ${userUuid}:`, error);
    return { success: false };
  }
}

// 查找指定用户的消费记录（通用版本）
async function findConsumptionRecordByType(
  userUuid: string,
  amount: number,
  transType: CreditsTransType
): Promise<{ expired_at: Date | null; order_no: string } | null> {
  try {
    // 查找最近的对应消费记录
    const consumptionRecord = await db()
      .select()
      .from(creditsTable)
      .where(
        and(
          eq(creditsTable.user_uuid, userUuid),
          eq(creditsTable.trans_type, transType),
          eq(creditsTable.credits, -amount) // 负数表示消费
        )
      )
      .orderBy(desc(creditsTable.created_at))
      .limit(1);

    if (consumptionRecord[0]) {
      return {
        expired_at: consumptionRecord[0].expired_at,
        order_no: consumptionRecord[0].order_no || ""
      };
    }

    return null;
  } catch (error) {
    console.error("Failed to find consumption record:", error);
    return null;
  }
}
