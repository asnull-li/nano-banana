import { handleWebhookCallback } from "@/services/nano-banana";

// Kie.ai webhook 回调数据结构
interface KieWebhookSuccess {
  code: 200;
  data: {
    taskId: string;
    state: "success";
    resultJson: string; // JSON string containing resultUrls
    consumeCredits: number;
    remainedCredits: number;
    completeTime?: number;
    createTime?: number;
    updateTime?: number;
    costTime?: number;
    model?: string;
    param?: string;
  };
  msg: string;
}

interface KieWebhookFailure {
  code: number;
  data: {
    taskId: string;
    state: "fail";
    failCode: string;
    failMsg: string;
    consumeCredits?: number;
    remainedCredits?: number;
    completeTime?: number;
    createTime?: number;
    updateTime?: number;
    model?: string;
    param?: string;
  };
  msg: string;
}

type KieWebhookData = KieWebhookSuccess | KieWebhookFailure;

// 处理 Kie.ai 的 webhook 回调
export async function handleKieWebhookCallback(body: KieWebhookData) {
  // 验证必要字段
  if (!body.data?.taskId) {
    console.error("Kie webhook missing taskId");
    return { success: false, error: "Missing taskId" };
  }

  const { data } = body;
  const taskId = data.taskId;

  // 根据状态处理
  if (data.state === "success" && "resultJson" in data) {
    // 成功状态
    try {
      // 解析结果 JSON
      const resultData = JSON.parse(data.resultJson);

      // 转换为系统格式并调用通用处理函数
      return await handleWebhookCallback({
        requestId: taskId, // Kie 的 taskId 就是我们的 requestId
        status: "COMPLETED",
        data: {
          images: resultData.resultUrls?.map((url: string) => ({ url })) || [],
          // 保存原始 Kie 数据供日志使用
          _kieData: {
            consumeCredits: data.consumeCredits,
            remainedCredits: data.remainedCredits,
            costTime: data.costTime,
          },
        },
        error: undefined,
      });
    } catch (parseError) {
      console.error("Failed to parse Kie resultJson:", parseError);
      return await handleWebhookCallback({
        requestId: taskId,
        status: "FAILED",
        data: undefined,
        error: { message: "Failed to parse result JSON" },
      });
    }
  } else if (data.state === "fail") {
    // 失败状态
    const failData = data as KieWebhookFailure["data"];
    return await handleWebhookCallback({
      requestId: taskId,
      status: "FAILED",
      data: undefined,
      error: {
        message: failData.failMsg || "Task failed",
      },
    });
  } else {
    // 未知状态
    console.warn("Unknown Kie webhook state:", (data as any).state);
    return { success: true }; // 返回成功避免重试
  }
}
