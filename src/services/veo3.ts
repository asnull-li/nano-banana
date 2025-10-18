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
} from "@/models/veo3";
import { getSnowId } from "@/lib/hash";
import {
  Veo3Model,
  Veo3TaskType,
  AspectRatio,
  GenerationType,
  getCreditsForModel,
  CREDITS_PER_1080P,
  supports1080p,
  getImageUrlsLimit,
  validateGenerationType,
  DEFAULT_IMAGE_TO_VIDEO_GENERATION_TYPE,
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
  generationType,
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
  generationType?: GenerationType;
}) {
  // 处理 generationType 默认值和校验
  let finalGenerationType = generationType;

  if (type === "image-to-video") {
    // 如果是图生视频但未指定 generationType，使用默认值
    if (!finalGenerationType) {
      finalGenerationType = DEFAULT_IMAGE_TO_VIDEO_GENERATION_TYPE;
    }

    // 校验图片数量
    const limits = getImageUrlsLimit(finalGenerationType);
    const imageCount = imageUrls?.length || 0;

    if (imageCount < limits.min || imageCount > limits.max) {
      throw new Error(
        `${finalGenerationType} mode requires ${limits.min}-${limits.max} image(s), but got ${imageCount}`
      );
    }

    // 校验 REFERENCE_2_VIDEO 的模型和宽高比限制
    const validation = validateGenerationType(finalGenerationType, model, aspectRatio);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
  }
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
    generationType: finalGenerationType,
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

// Veo3 webhook 回调数据结构（根据官方文档 https://docs.kie.ai/cn/veo3-api/generate-veo-3-video-callbacks.md）
interface Veo3WebhookSuccess {
  code: 200;
  data: {
    taskId: string;
    info: {
      resultUrls: string[];
      result_urls?: string[]; // 别名字段
      originUrls?: string[]; // 仅当宽高比不是16:9时存在
      resolution: string;
      has_audio_list?: boolean[];
      media_ids?: string[];
      seeds?: number[];
    };
    fallbackFlag: boolean; // 是否使用托底模型
    promptJson?: string; // 原始请求参数JSON
  };
  msg: string;
}

interface Veo3WebhookFailure {
  code: 400 | 422 | 500 | 501; // 失败状态码
  data: {
    taskId: string;
    fallbackFlag: boolean;
  };
  msg: string; // 错误描述信息
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
  if (body.code === 200 && "info" in data) {
    // 成功状态
    try {
      const info = data.info;
      const resultUrls = info.resultUrls || info.result_urls || [];
      const originUrls = info.originUrls;
      const resolution = info.resolution;

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
          resultUrls,
          originUrls,
          resolution,
          fallbackFlag: data.fallbackFlag,
          seeds: info.seeds,
          has_audio_list: info.has_audio_list,
        }),
        video_720p_url: video720pUrl,
        completed_at: new Date(),
        updated_at: new Date(),
      });

      console.log(`Task ${taskId} completed successfully (fallback: ${data.fallbackFlag})`);
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
    // 失败状态 (code: 400, 422, 500, 501)
    return await handleFailure(
      taskId,
      task,
      body.msg || "Task failed"
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
  // 先查询任务获取当前的 credits_used（taskId 是 task_id 主键）
  const task = await findTaskById(taskId);
  if (!task) {
    throw new Error(`Task not found: ${taskId}`);
  }

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
      task.task_id,
      "1080p"
    );
    finalUrl = r2Url;
    console.log(`1080P video transferred to R2: ${r2Url}`);
  } catch (transferError) {
    console.error("Failed to transfer 1080P video to R2:", transferError);
    // 继续使用原始 URL
  }

  // 更新任务记录
  await updateTaskStatus(task.task_id, {
    video_1080p_url: finalUrl,
    has_1080p: true,
    credits_used: task.credits_used + CREDITS_PER_1080P,
    updated_at: new Date(),
  });

  return {
    video1080pUrl: finalUrl,
    creditsUsed: CREDITS_PER_1080P,
    remainingCredits: creditCheck.currentCredits - CREDITS_PER_1080P,
  };
}
