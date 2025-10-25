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
} from "@/models/wan25";
import { getSnowId } from "@/lib/hash";
import {
  Wan25TaskType,
  Wan25AspectRatio,
  Wan25Duration,
  Wan25Resolution,
  calculateCredits,
} from "@/lib/constants/wan25";
import { transferVideoToR2 } from "@/lib/video-transfer";

// 处理视频生成提交逻辑
export async function processSubmitRequest({
  userUuid,
  type,
  prompt,
  duration,
  resolution,
  imageUrl,
  aspectRatio,
  negativePrompt,
  enablePromptExpansion,
  seed,
  requestId,
}: {
  userUuid: string;
  type: Wan25TaskType;
  prompt: string;
  duration: Wan25Duration;
  resolution: Wan25Resolution;
  imageUrl?: string;
  aspectRatio?: Wan25AspectRatio;
  negativePrompt?: string;
  enablePromptExpansion?: boolean;
  seed?: number;
  requestId: string;
}) {
  // 计算所需积分
  const creditsNeeded = calculateCredits(duration, resolution);

  // 检查用户积分
  const creditCheck = await checkUserCredits(userUuid, creditsNeeded);
  if (!creditCheck.hasEnough) {
    throw new Error(
      `Insufficient credits. Required: ${creditsNeeded}, Available: ${creditCheck.currentCredits}`
    );
  }

  // 生成任务ID
  const taskId = getSnowId();

  console.log(`[Wan25 Service] processSubmitRequest called:`, {
    userUuid,
    type,
    taskId,
    requestId,
    duration,
    resolution,
    creditsNeeded,
  });

  // 构建输入参数 JSON
  const input: any = {
    prompt,
    duration,
    resolution,
  };

  if (type === "text-to-video" && aspectRatio) {
    input.aspect_ratio = aspectRatio;
  }

  if (type === "image-to-video" && imageUrl) {
    input.image_url = imageUrl;
  }

  if (negativePrompt) {
    input.negative_prompt = negativePrompt;
  }

  if (enablePromptExpansion !== undefined) {
    input.enable_prompt_expansion = enablePromptExpansion;
  }

  if (seed !== undefined) {
    input.seed = seed;
  }

  // 创建数据库记录
  console.log(`[Wan25 Service] Inserting task into database:`, {
    task_id: taskId,
    request_id: requestId,
  });

  const task = await insertTask({
    task_id: taskId,
    request_id: requestId,
    user_uuid: userUuid,
    type,
    input: JSON.stringify(input),
    status: "waiting",
    credits_used: creditsNeeded,
    credits_refunded: 0,
    created_at: new Date(),
    updated_at: new Date(),
  });

  if (!task) {
    console.error(`[Wan25 Service] Failed to insert task into database`);
    throw new Error("Failed to create task record");
  }

  console.log(`[Wan25 Service] Task inserted successfully:`, {
    id: task.id,
    task_id: task.task_id,
    request_id: task.request_id,
  });

  // 扣除积分
  await decreaseCredits({
    user_uuid: userUuid,
    trans_type: CreditsTransType.Wan25,
    credits: creditsNeeded,
  });

  return {
    taskId,
    requestId,
    creditsUsed: creditsNeeded,
    remainingCredits: creditCheck.currentCredits - creditsNeeded,
  };
}

// KIE Jobs API webhook 回调数据结构
interface KieJobsWebhookSuccess {
  code: 200;
  msg: string;
  data: {
    taskId: string;
    model: string;
    state: "success";
    param: string; // JSON string
    resultJson: string; // JSON string: {resultUrls: string[]}
    costTime: number;
    completeTime: number;
    createTime: number;
  };
}

interface KieJobsWebhookFailure {
  code: number; // 400, 422, 500, etc.
  msg: string;
  data: {
    taskId: string;
    state: "fail";
    failCode: string;
    failMsg: string;
  };
}

type KieJobsWebhookData = KieJobsWebhookSuccess | KieJobsWebhookFailure;

// 处理 Wan 2.5 的 webhook 回调
export async function handleWan25WebhookCallback(
  body: KieJobsWebhookData
): Promise<{ success: boolean; error?: string }> {
  // 验证必要字段
  if (!body.data?.taskId) {
    console.error("Wan 2.5 webhook missing taskId");
    return { success: false, error: "Missing taskId" };
  }

  const { data } = body;
  const taskId = data.taskId;

  console.log(`[Wan25 Webhook] Received callback for taskId: ${taskId}`);
  console.log(`[Wan25 Webhook] Webhook body:`, JSON.stringify(body, null, 2));

  // 查找任务
  const task = await findTaskByRequestId(taskId);
  if (!task) {
    console.error(`[Wan25 Webhook] Task not found for request_id: ${taskId}`);
    console.error(`[Wan25 Webhook] This means the database has no record with request_id = ${taskId}`);
    console.error(`[Wan25 Webhook] Please check if the task was created successfully before the webhook arrived`);
    return { success: false, error: "Task not found" };
  }

  console.log(`[Wan25 Webhook] Found task:`, {
    task_id: task.task_id,
    request_id: task.request_id,
    status: task.status,
    user_uuid: task.user_uuid,
  });

  // 根据状态处理
  if (body.code === 200 && data.state === "success") {
    // 成功状态
    try {
      const resultJson = JSON.parse(data.resultJson || "{}");
      const resultUrls = resultJson.resultUrls || [];

      if (resultUrls.length === 0) {
        console.error("No video URLs in webhook response");
        return await handleFailure(taskId, task, "No video URLs returned");
      }

      // 转存视频到 R2
      console.log(`Transferring video to R2 for task ${task.task_id}...`);
      let videoUrl = resultUrls[0];

      try {
        const r2Url = await transferVideoToR2(
          resultUrls[0],
          task.user_uuid,
          task.task_id
        );
        videoUrl = r2Url;
        console.log(`Video transferred to R2: ${r2Url}`);
      } catch (transferError) {
        console.error("Failed to transfer video to R2:", transferError);
        // 继续使用原始 URL
      }

      // 更新任务状态
      await updateTaskByRequestId(taskId, {
        status: "success",
        result: data.resultJson,
        video_url: videoUrl,
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
    const failMsg = "failMsg" in data ? data.failMsg : body.msg;
    const failCode = "failCode" in data ? data.failCode : String(body.code);
    return await handleFailure(taskId, task, failMsg, failCode);
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
    status: "fail",
    error_message: errorMessage,
    error_code: errorCode,
    updated_at: new Date(),
  });

  // 退还积分
  if (task.credits_used > 0 && task.credits_refunded === 0) {
    await refundCreditsForTask(
      task.task_id,
      task.user_uuid,
      task.credits_used
    );
  }

  return { success: true };
}

// 退还积分
async function refundCreditsForTask(
  taskId: string,
  userUuid: string,
  amount: number
) {
  try {
    // 使用通用退款函数
    const refundResult = await refundCreditsWithOriginalExpiry({
      userUuid,
      amount,
      refundTransType: CreditsTransType.Wan25_refund,
      consumptionTransType: CreditsTransType.Wan25,
      taskId,
    });

    if (refundResult.success) {
      // 更新任务记录
      await updateTaskStatus(taskId, {
        credits_refunded: amount,
        updated_at: new Date(),
      });

      console.log(
        `Refunded ${amount} credits for Wan 2.5 task ${taskId}, expiry: ${refundResult.expiredAt}`
      );
      return true;
    } else {
      console.error(`Failed to refund credits for Wan 2.5 task ${taskId}`);
      return false;
    }
  } catch (error) {
    console.error(
      `Failed to refund credits for Wan 2.5 task ${taskId}:`,
      error
    );
    return false;
  }
}
