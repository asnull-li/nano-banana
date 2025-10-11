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
  findTaskById,
} from "@/models/sora2";
import { getSnowId } from "@/lib/hash";
import {
  Sora2TaskType,
  Sora2AspectRatio,
  CREDITS_PER_SORA2,
} from "@/lib/constants/sora2";
import { transferVideoToR2 } from "@/lib/video-transfer";

// 处理视频生成提交逻辑
export async function processSubmitRequest({
  userUuid,
  type,
  prompt,
  imageUrls,
  aspectRatio = "landscape",
  removeWatermark = true,
  requestId,
}: {
  userUuid: string;
  type: Sora2TaskType;
  prompt: string;
  imageUrls?: string[];
  aspectRatio?: Sora2AspectRatio;
  removeWatermark?: boolean;
  requestId: string;
}) {
  // 检查用户积分
  const creditCheck = await checkUserCredits(userUuid, CREDITS_PER_SORA2);
  if (!creditCheck.hasEnough) {
    throw new Error(
      `Insufficient credits. Required: ${CREDITS_PER_SORA2}, Available: ${creditCheck.currentCredits}`
    );
  }

  // 生成任务ID
  const taskId = getSnowId();

  // 构建输入参数 JSON
  const input = {
    prompt,
    imageUrls,
    aspectRatio,
    removeWatermark,
  };

  // 创建数据库记录
  const task = await insertTask({
    task_id: taskId,
    request_id: requestId,
    user_uuid: userUuid,
    type,
    input: JSON.stringify(input),
    status: "waiting",
    credits_used: CREDITS_PER_SORA2,
    credits_refunded: 0,
    created_at: new Date(),
    updated_at: new Date(),
  });

  if (!task) {
    throw new Error("Failed to create task record");
  }

  // 扣除积分
  await decreaseCredits({
    user_uuid: userUuid,
    trans_type: CreditsTransType.Sora2,
    credits: CREDITS_PER_SORA2,
  });

  return {
    taskId,
    requestId,
    creditsUsed: CREDITS_PER_SORA2,
    remainingCredits: creditCheck.currentCredits - CREDITS_PER_SORA2,
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

// 处理 Sora 2 的 webhook 回调
export async function handleSora2WebhookCallback(
  body: KieJobsWebhookData
): Promise<{ success: boolean; error?: string }> {
  // 验证必要字段
  if (!body.data?.taskId) {
    console.error("Sora 2 webhook missing taskId");
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
  if (body.code === 200 && data.state === "success") {
    // 成功状态
    try {
      const resultJson = JSON.parse(data.resultJson || "{}");
      const resultUrls = resultJson.resultUrls || [];

      if (resultUrls.length === 0) {
        console.error("No video URLs in webhook response");
        return await handleFailure(taskId, task, "No video URLs returned");
      }

      // 转存视频到 R2（只转存第一个视频）
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
      refundTransType: CreditsTransType.Sora2_refund,
      consumptionTransType: CreditsTransType.Sora2,
      taskId,
    });

    if (refundResult.success) {
      // 更新任务记录
      await updateTaskStatus(taskId, {
        credits_refunded: amount,
        updated_at: new Date(),
      });

      console.log(
        `Refunded ${amount} credits for Sora 2 task ${taskId}, expiry: ${refundResult.expiredAt}`
      );
      return true;
    } else {
      console.error(`Failed to refund credits for Sora 2 task ${taskId}`);
      return false;
    }
  } catch (error) {
    console.error(
      `Failed to refund credits for Sora 2 task ${taskId}:`,
      error
    );
    return false;
  }
}
