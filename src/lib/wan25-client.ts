// Wan 2.5 API 客户端封装（基于 KIE Jobs API）

import {
  Wan25TaskType,
  Wan25AspectRatio,
  Wan25Duration,
  Wan25Resolution,
} from "./constants/wan25";

// Wan 2.5 生成视频请求参数
interface Wan25GenerateRequest {
  type: Wan25TaskType;
  prompt: string;
  duration: Wan25Duration;
  resolution: Wan25Resolution;
  imageUrl?: string; // 仅 image-to-video
  aspectRatio?: Wan25AspectRatio; // 仅 text-to-video
  negativePrompt?: string;
  enablePromptExpansion?: boolean;
  seed?: number;
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

// 调用 Wan 2.5 API 生成视频
export async function generateWan25Video(
  params: Wan25GenerateRequest
): Promise<string> {
  const apiKey = process.env.KIE_API_KEY;
  if (!apiKey) {
    throw new Error("KIE_API_KEY not configured");
  }

  // 确定 API model 名称
  const apiModelName =
    params.type === "text-to-video"
      ? "wan/2-5-text-to-video"
      : "wan/2-5-image-to-video";

  const requestBody: any = {
    model: apiModelName,
    input: {
      prompt: params.prompt,
      duration: params.duration,
      resolution: params.resolution,
    },
  };

  // Text-to-video: 添加 aspect_ratio
  if (params.type === "text-to-video" && params.aspectRatio) {
    requestBody.input.aspect_ratio = params.aspectRatio;
  }

  // Image-to-video: 添加 image_url
  if (params.type === "image-to-video" && params.imageUrl) {
    requestBody.input.image_url = params.imageUrl;
  }

  // 可选参数
  if (params.negativePrompt) {
    requestBody.input.negative_prompt = params.negativePrompt;
  }

  if (params.enablePromptExpansion !== undefined) {
    requestBody.input.enable_prompt_expansion = params.enablePromptExpansion;
  }

  if (params.seed !== undefined) {
    requestBody.input.seed = params.seed;
  }

  // 添加回调URL
  if (params.callBackUrl) {
    requestBody.callBackUrl = params.callBackUrl;
  }

  console.log("Wan 2.5 generate request:", {
    model: apiModelName,
    type: params.type,
    duration: params.duration,
    resolution: params.resolution,
    aspectRatio: params.aspectRatio,
    hasImageUrl: !!params.imageUrl,
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
    console.error("Wan 2.5 API error response:", errorText);
    throw new Error(
      `Wan 2.5 API error: ${response.status} ${response.statusText}`
    );
  }

  const result: KieJobsCreateResponse = await response.json();

  if (result.code !== 200) {
    throw new Error(`Wan 2.5 API error: ${result.msg}`);
  }

  console.log("Wan 2.5 task created:", result.data.taskId);
  return result.data.taskId;
}

// 查询视频生成详情
export async function getWan25TaskStatus(
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
    console.error("Wan 2.5 getWan25TaskStatus error:", errorText);
    throw new Error(
      `Wan 2.5 API error: ${response.status} ${response.statusText}`
    );
  }

  const result: KieJobsRecordInfoResponse = await response.json();

  if (result.code !== 200) {
    throw new Error(`Wan 2.5 API error: ${result.msg}`);
  }

  return result.data;
}
