import {
  checkUserCredits,
  decreaseCredits,
  increaseCredits,
  CreditsTransType,
} from "@/services/credit";
import {
  insertTask,
  updateTaskStatus,
  updateTaskByRequestId,
  findTaskByRequestId,
} from "@/models/upscaler";
import { getSnowId } from "@/lib/hash";
import { CREDITS_PER_UPSCALE, UpscalerInput } from "@/lib/constants/upscaler";
import { transferImagesToR2 } from "@/lib/image-transfer";

// 处理 Upscaler 任务提交逻辑
export async function processUpscalerSubmit({
  userUuid,
  input,
  requestId,
  provider = 'kie',
}: {
  userUuid: string;
  input: UpscalerInput;
  requestId: string;
  provider?: string;
}) {
  // 计算积分消耗
  const creditsNeeded = CREDITS_PER_UPSCALE;

  // 检查用户积分
  const creditCheck = await checkUserCredits(userUuid, creditsNeeded);
  if (!creditCheck.hasEnough) {
    throw new Error(
      `Insufficient credits. Required: ${creditsNeeded}, Available: ${creditCheck.currentCredits}`
    );
  }

  // 生成任务ID
  const taskId = getSnowId();

  // 创建数据库记录
  const task = await insertTask({
    task_id: taskId,
    request_id: requestId,
    user_uuid: userUuid,
    input: JSON.stringify(input), // 将输入参数序列化为 JSON
    provider,
    status: "pending",
    credits_used: creditsNeeded,
    credits_refunded: 0,
    created_at: new Date(),
    updated_at: new Date(),
  });

  if (!task) {
    throw new Error("Failed to create upscaler task record");
  }

  // 扣除积分
  await decreaseCredits({
    user_uuid: userUuid,
    trans_type: CreditsTransType.Upscaler_submit,
    credits: creditsNeeded,
  });

  return {
    taskId,
    requestId,
    creditsUsed: creditsNeeded,
    remainingCredits: creditCheck.currentCredits - creditsNeeded,
  };
}

// 处理 Upscaler webhook 回调
export async function handleUpscalerWebhookCallback({
  requestId,
  status,
  data,
  error,
}: {
  requestId: string;
  status: string;
  data?: any;
  error?: { message: string };
}) {
  // 查找任务
  const task = await findTaskByRequestId(requestId);
  if (!task) {
    console.error(`Upscaler task not found for request_id: ${requestId}`);
    return { success: false, error: "Task not found" };
  }

  // 处理成功结果
  if ((status === "OK" || status === "COMPLETED") && data) {
    console.log(`Upscaler task ${requestId} completed successfully with payload:`, data);
    
    // 尝试转存图片到 R2
    let finalResult = data;
    if (data.images && Array.isArray(data.images)) {
      try {
        const imageUrls = data.images.map((img: any) => img.url || img);
        const r2Urls = await transferImagesToR2(imageUrls, "upscaler");
        finalResult = {
          ...data,
          images: r2Urls.map((url: string) => ({ url })),
        };
        console.log(`Successfully transferred upscaled images to R2:`, r2Urls);
      } catch (transferError) {
        console.error("Failed to transfer upscaled images to R2:", transferError);
        // 继续使用原始 URLs
      }
    }

    await updateTaskByRequestId(requestId, {
      status: "completed",
      result: JSON.stringify(finalResult),
      updated_at: new Date(),
    });
    return { success: true };
  }

  // 处理失败，退还积分
  if (status === "FAILED" || error) {
    await updateTaskByRequestId(requestId, {
      status: "failed",
      error_message: error?.message || "Task failed",
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

  // 更新处理中状态
  if (status === "IN_PROGRESS" || status === "IN_QUEUE") {
    await updateTaskByRequestId(requestId, {
      status: "processing",
      updated_at: new Date(),
    });
  }

  return { success: true };
}

// 退还积分
export async function refundCreditsForTask(
  taskId: string,
  userUuid: string,
  amount: number
) {
  try {
    // 设置退还积分的有效期为30天
    const expiredAt = new Date();
    expiredAt.setDate(expiredAt.getDate() + 30);

    // 增加退款积分
    await increaseCredits({
      user_uuid: userUuid,
      trans_type: CreditsTransType.Upscaler_refund,
      credits: amount,
      expired_at: expiredAt.toISOString(),
    });

    // 更新任务记录
    await updateTaskStatus(taskId, {
      credits_refunded: amount,
      updated_at: new Date(),
    });

    console.log(`Refunded ${amount} credits for upscaler task ${taskId}`);
    return true;
  } catch (error) {
    console.error(`Failed to refund credits for upscaler task ${taskId}:`, error);
    return false;
  }
}

// 处理 KIE Upscaler webhook
export async function handleKieUpscalerWebhook(body: any) {
  // 验证必要字段
  if (!body.data?.taskId) {
    console.error("KIE Upscaler webhook missing taskId");
    return { success: false, error: "Missing taskId" };
  }

  const { data } = body;
  const taskId = data.taskId;

  // 根据状态处理
  if (data.state === "success" && data.resultJson) {
    // 成功状态
    try {
      // 解析结果 JSON
      const resultData = JSON.parse(data.resultJson);

      // 转存图片到 R2
      let finalImageUrls = resultData.resultUrls || [];
      if (finalImageUrls.length > 0) {
        console.log(`Transferring ${finalImageUrls.length} upscaled images to R2...`);
        try {
          const r2Urls = await transferImagesToR2(finalImageUrls, "upscaler");
          finalImageUrls = r2Urls;
          console.log(`Successfully transferred upscaled images to R2:`, r2Urls);
        } catch (transferError) {
          console.error("Failed to transfer upscaled images to R2:", transferError);
          // 继续使用原始 URLs
        }
      }

      // 调用通用处理函数
      return await handleUpscalerWebhookCallback({
        requestId: taskId,
        status: "COMPLETED",
        data: {
          images: finalImageUrls.map((url: string) => ({ url })),
          _kieData: {
            consumeCredits: data.consumeCredits,
            remainedCredits: data.remainedCredits,
            costTime: data.costTime,
          },
        },
        error: undefined,
      });
    } catch (parseError) {
      console.error("Failed to parse KIE Upscaler resultJson:", parseError);
      return await handleUpscalerWebhookCallback({
        requestId: taskId,
        status: "FAILED",
        data: undefined,
        error: { message: "Failed to parse result JSON" },
      });
    }
  } else if (data.state === "fail") {
    // 失败状态
    return await handleUpscalerWebhookCallback({
      requestId: taskId,
      status: "FAILED",
      data: undefined,
      error: {
        message: data.failMsg || "Task failed",
      },
    });
  } else {
    // 未知状态
    console.warn("Unknown KIE Upscaler webhook state:", data.state);
    return { success: true }; // 返回成功避免重试
  }
}