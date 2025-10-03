// Veo3 API 客户端封装

import { Veo3Model, AspectRatio } from "./constants/veo3";

// Veo3 生成视频请求参数
interface Veo3GenerateRequest {
  prompt: string;
  model: Veo3Model;
  imageUrls?: string[];
  watermark?: string;
  aspectRatio?: AspectRatio;
  seeds?: number;
  callBackUrl?: string;
  enableFallback?: boolean;
  enableTranslation?: boolean;
}

// Veo3 生成视频响应
interface Veo3GenerateResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

// Veo3 查询视频详情响应
interface Veo3VideoDetailsResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    paramJson: string;
    completeTime: number;
    response: {
      resultUrls: string[];
      originUrls?: string[];
      resolution: string;
    };
    successFlag: number; // 0: in progress, 1: success, 2: failure
    errorCode?: string;
    errorMessage?: string;
    fallbackFlag?: boolean;
  };
}

// Veo3 获取1080P视频响应
interface Veo3Get1080pResponse {
  code: number;
  msg: string;
  data: {
    resultUrl: string;
  };
}

// 调用 Veo3 API 生成视频
export async function generateVideo(
  params: Veo3GenerateRequest
): Promise<string> {
  const apiKey = process.env.KIE_API_KEY;
  if (!apiKey) {
    throw new Error("KIE_API_KEY not configured");
  }

  const requestBody = {
    prompt: params.prompt,
    model: params.model,
    imageUrls: params.imageUrls,
    watermark: params.watermark,
    aspectRatio: params.aspectRatio,
    seeds: params.seeds,
    callBackUrl: params.callBackUrl,
    enableFallback: params.enableFallback ?? false,
    enableTranslation: params.enableTranslation ?? true,
  };

  console.log("Veo3 generate request:", {
    model: params.model,
    aspectRatio: params.aspectRatio,
    hasImageUrls: !!params.imageUrls?.length,
  });

  const response = await fetch("https://api.kie.ai/api/v1/veo/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Veo3 API error response:", errorText);
    throw new Error(
      `Veo3 API error: ${response.status} ${response.statusText}`
    );
  }

  const result: Veo3GenerateResponse = await response.json();

  if (result.code !== 200) {
    throw new Error(`Veo3 API error: ${result.msg}`);
  }

  console.log("Veo3 task created:", result.data.taskId);
  return result.data.taskId;
}

// 查询视频生成详情
export async function getVideoDetails(
  taskId: string
): Promise<Veo3VideoDetailsResponse["data"]> {
  const apiKey = process.env.KIE_API_KEY;
  if (!apiKey) {
    throw new Error("KIE_API_KEY not configured");
  }

  const url = new URL("https://api.kie.ai/api/v1/veo/record-info");
  url.searchParams.append("taskId", taskId);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Veo3 getVideoDetails error:", errorText);
    throw new Error(
      `Veo3 API error: ${response.status} ${response.statusText}`
    );
  }

  const result: Veo3VideoDetailsResponse = await response.json();

  if (result.code !== 200) {
    throw new Error(`Veo3 API error: ${result.msg}`);
  }

  return result.data;
}

// 获取1080P高清视频
export async function get1080pVideo(
  taskId: string,
  index?: number
): Promise<string> {
  const apiKey = process.env.KIE_API_KEY;
  if (!apiKey) {
    throw new Error("KIE_API_KEY not configured");
  }

  const url = new URL("https://api.kie.ai/api/v1/veo/get-1080p-video");
  url.searchParams.append("taskId", taskId);
  if (index !== undefined) {
    url.searchParams.append("index", index.toString());
  }

  console.log("Requesting 1080P video for taskId:", taskId);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Veo3 get1080p error:", errorText);
    throw new Error(
      `Veo3 API error: ${response.status} ${response.statusText}`
    );
  }

  const result: Veo3Get1080pResponse = await response.json();

  if (result.code !== 200) {
    throw new Error(`Veo3 API error: ${result.msg}`);
  }

  console.log("1080P video URL received:", result.data.resultUrl);
  return result.data.resultUrl;
}
