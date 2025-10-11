// Sora 2 API 客户端封装（基于 KIE Jobs API）

import { Sora2TaskType, Sora2AspectRatio } from "./constants/sora2";

// Mock 模式开关 - 开发环境下节省成本
const ENABLE_MOCK = process.env.NEXT_PUBLIC_SORA2_MOCK === "true";

// Sora 2 生成视频请求参数
interface Sora2GenerateRequest {
  type: Sora2TaskType;
  prompt: string;
  imageUrls?: string[];
  aspectRatio?: Sora2AspectRatio;
  removeWatermark?: boolean;
  callBackUrl?: string;
}

// KIE Jobs API 创建任务响应
interface KieJobsCreateResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

// KIE Jobs API 查询任务响应
interface KieJobsRecordInfoResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    model: string;
    state: "waiting" | "success" | "fail";
    param: string; // JSON string
    resultJson: string; // JSON string: {resultUrls: string[]}
    failCode: string | null;
    failMsg: string | null;
    costTime: number | null;
    completeTime: number | null;
    createTime: number;
  };
}

// 调用 Sora 2 API 生成视频
export async function generateSora2Video(
  params: Sora2GenerateRequest
): Promise<string> {
  // Mock 模式 - 立即返回假的 taskId
  if (ENABLE_MOCK) {
    const mockTaskId = `mock_sora2_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    console.log("🎭 [MOCK MODE] Sora 2 generateVideo:", mockTaskId);

    // 模拟 3 秒后触发 webhook
    if (params.callBackUrl) {
      setTimeout(async () => {
        try {
          await fetch(params.callBackUrl!, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: 200,
              msg: "success",
              data: {
                taskId: mockTaskId,
                model: params.type === "text-to-video"
                  ? "sora-2-text-to-video"
                  : "sora-2-image-to-video",
                state: "success",
                resultJson: JSON.stringify({
                  resultUrls: [
                    "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                  ]
                }),
                completeTime: Date.now(),
              }
            })
          });
          console.log("🎭 [MOCK MODE] Webhook sent for:", mockTaskId);
        } catch (error) {
          console.error("🎭 [MOCK MODE] Webhook failed:", error);
        }
      }, 3000);
    }

    return mockTaskId;
  }

  const apiKey = process.env.KIE_API_KEY;
  if (!apiKey) {
    throw new Error("KIE_API_KEY not configured");
  }

  // 根据任务类型确定模型
  const model = params.type === "text-to-video"
    ? "sora-2-text-to-video"
    : "sora-2-image-to-video";

  const requestBody: any = {
    model,
    input: {
      prompt: params.prompt,
      aspect_ratio: params.aspectRatio || "landscape",
      remove_watermark: params.removeWatermark ?? true,
    },
  };

  // 添加图片URL（仅在 image-to-video 模式下）
  if (params.type === "image-to-video" && params.imageUrls) {
    requestBody.input.image_urls = params.imageUrls;
  }

  // 添加回调URL
  if (params.callBackUrl) {
    requestBody.callBackUrl = params.callBackUrl;
  }

  console.log("Sora 2 generate request:", {
    model,
    type: params.type,
    aspectRatio: params.aspectRatio,
    hasImageUrls: !!params.imageUrls?.length,
  });

  const response = await fetch("https://api.kie.ai/api/v1/jobs/createTask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Sora 2 API error response:", errorText);
    throw new Error(
      `Sora 2 API error: ${response.status} ${response.statusText}`
    );
  }

  const result: KieJobsCreateResponse = await response.json();

  if (result.code !== 200) {
    throw new Error(`Sora 2 API error: ${result.msg}`);
  }

  console.log("Sora 2 task created:", result.data.taskId);
  return result.data.taskId;
}

// 查询视频生成详情
export async function getSora2TaskStatus(
  taskId: string
): Promise<KieJobsRecordInfoResponse["data"]> {
  const apiKey = process.env.KIE_API_KEY;
  if (!apiKey) {
    throw new Error("KIE_API_KEY not configured");
  }

  const url = new URL("https://api.kie.ai/api/v1/jobs/recordInfo");
  url.searchParams.append("taskId", taskId);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Sora 2 getSora2TaskStatus error:", errorText);
    throw new Error(
      `Sora 2 API error: ${response.status} ${response.statusText}`
    );
  }

  const result: KieJobsRecordInfoResponse = await response.json();

  if (result.code !== 200) {
    throw new Error(`Sora 2 API error: ${result.msg}`);
  }

  return result.data;
}
