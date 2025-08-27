import { 
  checkUserCredits, 
  decreaseCredits, 
  increaseCredits,
  CreditsTransType
} from "@/services/credit";
import { 
  insertTask, 
  updateTaskStatus, 
  updateTaskByRequestId,
  findTaskByRequestId 
} from "@/models/nano-banana";
import { getSnowId } from "@/lib/hash";
import { CREDITS_PER_IMAGE, TaskType } from "@/lib/constants/nano-banana";

// 处理任务提交逻辑
export async function processSubmitRequest({
  userUuid,
  type,
  prompt,
  imageUrls,
  numImages,
  requestId
}: {
  userUuid: string;
  type: TaskType;
  prompt: string;
  imageUrls?: string[];
  numImages: number;
  requestId: string;
}) {
  // 计算积分消耗
  const creditsNeeded = numImages * CREDITS_PER_IMAGE;
  
  // 检查用户积分
  const creditCheck = await checkUserCredits(userUuid, creditsNeeded);
  if (!creditCheck.hasEnough) {
    throw new Error(`Insufficient credits. Required: ${creditsNeeded}, Available: ${creditCheck.currentCredits}`);
  }

  // 生成任务ID
  const taskId = getSnowId();

  // 创建数据库记录
  const task = await insertTask({
    task_id: taskId,
    request_id: requestId,
    user_uuid: userUuid,
    type,
    prompt,
    image_urls: imageUrls ? JSON.stringify(imageUrls) : null,
    num_images: numImages,
    status: 'pending',
    credits_used: creditsNeeded,
    credits_refunded: 0,
    created_at: new Date(),
    updated_at: new Date()
  });

  if (!task) {
    throw new Error('Failed to create task record');
  }

  // 扣除积分
  await decreaseCredits({
    user_uuid: userUuid,
    trans_type: type === 'text-to-image' 
      ? CreditsTransType.NanoBanana_generate 
      : CreditsTransType.NanoBanana_edit,
    credits: creditsNeeded
  });

  return {
    taskId,
    requestId,
    creditsUsed: creditsNeeded,
    remainingCredits: creditCheck.currentCredits - creditsNeeded
  };
}

// 处理webhook回调
export async function handleWebhookCallback({
  requestId,
  status,
  data,
  error
}: {
  requestId: string;
  status: string;
  data?: any;
  error?: { message: string };
}) {
  // 查找任务
  const task = await findTaskByRequestId(requestId);
  if (!task) {
    console.error(`Task not found for request_id: ${requestId}`);
    return { success: false, error: 'Task not found' };
  }

  // 处理成功结果 - 支持 'OK' 和 'COMPLETED' 状态
  if ((status === 'OK' || status === 'COMPLETED') && data) {
    console.log(`Task ${requestId} completed successfully with payload:`, data);
    await updateTaskByRequestId(requestId, {
      status: 'completed',
      result: JSON.stringify(data),
      updated_at: new Date()
    });
    return { success: true };
  }

  // 处理失败，退还积分
  if (status === 'FAILED' || error) {
    await updateTaskByRequestId(requestId, {
      status: 'failed',
      error_message: error?.message || 'Task failed',
      updated_at: new Date()
    });

    // 退还积分
    if (task.credits_used > 0 && task.credits_refunded === 0) {
      await refundCreditsForTask(task.task_id, task.user_uuid, task.credits_used);
    }
    
    return { success: true };
  }

  // 更新处理中状态
  if (status === 'IN_PROGRESS' || status === 'IN_QUEUE') {
    await updateTaskByRequestId(requestId, {
      status: 'processing',
      updated_at: new Date()
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
      trans_type: CreditsTransType.NanoBanana_refund,
      credits: amount,
      expired_at: expiredAt.toISOString()
    });

    // 更新任务记录
    await updateTaskStatus(taskId, {
      credits_refunded: amount,
      updated_at: new Date()
    });

    console.log(`Refunded ${amount} credits for task ${taskId}`);
    return true;
  } catch (error) {
    console.error(`Failed to refund credits for task ${taskId}:`, error);
    return false;
  }
}