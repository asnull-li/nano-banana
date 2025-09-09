// KIE Upscaler API 客户端封装

interface KieUpscalerRequest {
  model: string;
  callBackUrl?: string;
  input: {
    image: string;
    scale?: number;
    face_enhance?: boolean;
  };
}

interface KieUpscalerResponse {
  code: number;
  message: string;
  data: {
    taskId: string;
  };
}

// 调用 KIE API 创建 Upscaler 任务
async function createKieUpscalerTask(request: KieUpscalerRequest): Promise<string> {
  const apiKey = process.env.KIE_API_KEY;
  if (!apiKey) {
    throw new Error("KIE_API_KEY not configured");
  }

  const response = await fetch("https://api.kie.ai/api/v1/jobs/createTask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("KIE Upscaler API error response:", errorText);
    throw new Error(`KIE Upscaler API error: ${response.status} ${response.statusText}`);
  }

  const result: KieUpscalerResponse = await response.json();

  if (result.code !== 200) {
    throw new Error(`KIE Upscaler API error: ${result.message}`);
  }

  return result.data.taskId;
}

// 提交图片放大任务
export async function submitUpscaleTask(
  imageUrl: string,
  scale: number = 2,
  faceEnhance: boolean = false,
  webhookUrl?: string
): Promise<string> {
  // 验证参数
  if (!imageUrl) {
    throw new Error("Image URL is required");
  }

  if (scale < 1 || scale > 4) {
    throw new Error("Scale must be between 1 and 4");
  }

  const request: KieUpscalerRequest = {
    model: "nano-banana-upscale",
    callBackUrl: webhookUrl,
    input: {
      image: imageUrl,
      scale: scale,
      face_enhance: faceEnhance,
    },
  };

  return await createKieUpscalerTask(request);
}