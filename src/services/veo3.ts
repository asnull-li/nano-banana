import {
  checkUserCredits,
  decreaseCredits,
  CreditsTransType,
  refundCreditsWithOriginalExpiry,
} from "@/services/credit";
import {
  insertTask,
  updateTaskStatus,
  updateTaskByRequestId,
  findTaskByRequestId,
} from "@/models/veo3";
import { getSnowId } from "@/lib/hash";
import {
  Veo3Model,
  Veo3TaskType,
  AspectRatio,
  getCreditsForModel,
  CREDITS_PER_1080P,
  supports1080p,
} from "@/lib/constants/veo3";
import { transferVideoToR2 } from "@/lib/video-transfer";

// 处理视频生成提交逻辑
export async function processSubmitRequest({
  userUuid,
  type,
  model,
  prompt,
  imageUrls,
  aspectRatio = "16:9",
  watermark,
  seeds,
  requestId,
}: {
  userUuid: string;
  type: Veo3TaskType;
  model: Veo3Model;
  prompt: string;
  imageUrls?: string[];
  aspectRatio?: AspectRatio;
  watermark?: string;
  seeds?: number;
  requestId: string;
}) {
  // 计算积分消耗
  const creditsNeeded = getCreditsForModel(model);

  // 检查用户积分
  const creditCheck = await checkUserCredits(userUuid, creditsNeeded);
  if (!creditCheck.hasEnough) {
    throw new Error(
      `Insufficient credits. Required: ${creditsNeeded}, Available: ${creditCheck.currentCredits}`
    );
  }

  // 生成任务ID
  const taskId = getSnowId();

  // 构建输入参数 JSON
  const input = {
    prompt,
    imageUrls,
    aspectRatio,
    watermark,
    seeds,
  };

  // 创建数据库记录
  const task = await insertTask({
    task_id: taskId,
    request_id: requestId,
    user_uuid: userUuid,
    type,
    model,
    input: JSON.stringify(input),
    status: "pending",
    credits_used: creditsNeeded,
    credits_refunded: 0,
    has_1080p: false,
    created_at: new Date(),
    updated_at: new Date(),
  });

  if (!task) {
    throw new Error("Failed to create task record");
  }

  // 扣除积分
  const transType =
    model === "veo3" ? CreditsTransType.Veo3_quality : CreditsTransType.Veo3_fast;

  await decreaseCredits({
    user_uuid: userUuid,
    trans_type: transType,
    credits: creditsNeeded,
  });

  return {
    taskId,
    requestId,
    creditsUsed: creditsNeeded,
    remainingCredits: creditCheck.currentCredits - creditsNeeded,
  };
}

// Veo3 webhook 回调数据结构
interface Veo3WebhookSuccess {
  code: 200;
  data: {
    taskId: string;
    resultUrls: string[];
    originUrls?: string[];
    resolution: string;
  };
  msg: string;
}

interface Veo3WebhookFailure {
  code: number;
  data: {
    taskId: string;
    errorCode: string;
    errorMessage: string;
  };
  msg: string;
}

type Veo3WebhookData = Veo3WebhookSuccess | Veo3WebhookFailure;

// 处理 Veo3 的 webhook 回调
export async function handleVeo3WebhookCallback(body: Veo3WebhookData): Promise<{ success: boolean; error?: string }> {
  // 验证必要字段
  if (!body.data?.taskId) {
    console.error("Veo3 webhook missing taskId");
    return { success: false, error: "Missing taskId" };
  }

  const { data } = body;
  const taskId = data.taskId;

  // 查找任务
  const task = await findTaskByRequestId(taskId);
  if (!task) {
    console.error(`Task not found for request_id: ${taskId}`);
    return { success: false, error: "Task not found" };
  }

  // 根据状态处理
  if (body.code === 200 && "resultUrls" in data) {
    // 成功状态
    try {
      const resultUrls = data.resultUrls || [];
      const resolution = data.resolution;

      if (resultUrls.length === 0) {
        console.error("No video URLs in webhook response");
        return await handleFailure(taskId, task, "No video URLs returned");
      }

      // 转存视频到 R2（只转存第一个720p视频）
      console.log(`Transferring video to R2 for task ${task.task_id}...`);
      let video720pUrl = resultUrls[0];

      try {
        const r2Url = await transferVideoToR2(
          resultUrls[0],
          task.user_uuid,
          task.task_id,
          "720p"
        );
        video720pUrl = r2Url;
        console.log(`Video transferred to R2: ${r2Url}`);
      } catch (transferError) {
        console.error("Failed to transfer video to R2:", transferError);
        // 继续使用原始 URL
      }

      // 更新任务状态
      await updateTaskByRequestId(taskId, {
        status: "completed",
        result: JSON.stringify({
          resultUrls: data.resultUrls,
          originUrls: data.originUrls,
          resolution,
        }),
        video_720p_url: video720pUrl,
        completed_at: new Date(),
        updated_at: new Date(),
      });

      console.log(`Task ${taskId} completed successfully`);
      return { success: true };
    } catch (error) {
      console.error("Failed to process success webhook:", error);
      return await handleFailure(
        taskId,
        task,
        error instanceof Error ? error.message : "Processing failed"
      );
    }
  } else {
    // 失败状态
    const failData = data as Veo3WebhookFailure["data"];
    return await handleFailure(
      taskId,
      task,
      failData.errorMessage || "Task failed",
      failData.errorCode
    );
  }
}

// 处理任务失败和退款
async function handleFailure(
  requestId: string,
  task: any,
  errorMessage: string,
  errorCode?: string
) {
  await updateTaskByRequestId(requestId, {
    status: "failed",
    error_message: errorMessage,
    error_code: errorCode,
    updated_at: new Date(),
  });

  // 退还积分
  if (task.credits_used > 0 && task.credits_refunded === 0) {
    await refundCreditsForTask(
      task.task_id,
      task.user_uuid,
      task.credits_used,
      task.model
    );
  }

  return { success: true };
}

// 退还积分
async function refundCreditsForTask(
  taskId: string,
  userUuid: string,
  amount: number,
  model: Veo3Model
) {
  try {
    // 根据模型确定消费类型
    const consumptionTransType =
      model === "veo3"
        ? CreditsTransType.Veo3_quality
        : CreditsTransType.Veo3_fast;

    // 使用通用退款函数
    const refundResult = await refundCreditsWithOriginalExpiry({
      userUuid,
      amount,
      refundTransType: CreditsTransType.Veo3_refund,
      consumptionTransType,
      taskId,
    });

    if (refundResult.success) {
      // 更新任务记录
      await updateTaskStatus(taskId, {
        credits_refunded: amount,
        updated_at: new Date(),
      });

      console.log(
        `Refunded ${amount} credits for Veo3 task ${taskId}, expiry: ${refundResult.expiredAt}`
      );
      return true;
    } else {
      console.error(`Failed to refund credits for Veo3 task ${taskId}`);
      return false;
    }
  } catch (error) {
    console.error(`Failed to refund credits for Veo3 task ${taskId}:`, error);
    return false;
  }
}

// 处理1080P升级请求
export async function processGet1080pRequest({
  userUuid,
  taskId,
  video1080pUrl,
}: {
  userUuid: string;
  taskId: string;
  video1080pUrl: string;
}) {
  // 检查用户积分
  const creditCheck = await checkUserCredits(userUuid, CREDITS_PER_1080P);
  if (!creditCheck.hasEnough) {
    throw new Error(
      `Insufficient credits for 1080P upgrade. Required: ${CREDITS_PER_1080P}, Available: ${creditCheck.currentCredits}`
    );
  }

  // 扣除积分
  await decreaseCredits({
    user_uuid: userUuid,
    trans_type: CreditsTransType.Veo3_1080p,
    credits: CREDITS_PER_1080P,
  });

  // 转存1080P视频到 R2
  let finalUrl = video1080pUrl;
  try {
    const r2Url = await transferVideoToR2(
      video1080pUrl,
      userUuid,
      taskId,
      "1080p"
    );
    finalUrl = r2Url;
    console.log(`1080P video transferred to R2: ${r2Url}`);
  } catch (transferError) {
    console.error("Failed to transfer 1080P video to R2:", transferError);
    // 继续使用原始 URL
  }

  // 更新任务记录
  await updateTaskStatus(taskId, {
    video_1080p_url: finalUrl,
    has_1080p: true,
    credits_used: (await findTaskByRequestId(taskId))!.credits_used + CREDITS_PER_1080P,
    updated_at: new Date(),
  });

  return {
    video1080pUrl: finalUrl,
    creditsUsed: CREDITS_PER_1080P,
    remainingCredits: creditCheck.currentCredits - CREDITS_PER_1080P,
  };
}
