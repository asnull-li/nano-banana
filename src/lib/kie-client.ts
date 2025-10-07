// Kie.ai API 客户端封装

interface KieApiRequest {
  model: string;
  callBackUrl?: string;
  input: {
    prompt: string;
    image_urls?: string[];
    output_format?: string;
    image_size?: string;
  };
}

interface KieApiResponse {
  code: number;
  message: string;
  data: {
    taskId: string;
  };
}

// 调用 Kie.ai API 创建任务
async function createKieTask(request: KieApiRequest): Promise<string> {
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
    console.error("Kie API error response:", errorText);
    throw new Error(`Kie API error: ${response.status} ${response.statusText}`);
  }

  const result: KieApiResponse = await response.json();

  if (result.code !== 200) {
    throw new Error(`Kie API error: ${result.message}`);
  }

  return result.data.taskId;
}

// 提交文本生成图像任务
export async function submitTextToImage(
  prompt: string,
  numImages: number = 1,
  webhookUrl?: string,
  imageSize: string = "auto",
  outputFormat: string = "png"
): Promise<string> {
  const request: KieApiRequest = {
    model: "google/nano-banana",
    callBackUrl: webhookUrl,
    input: {
      prompt,
      output_format: outputFormat,
      image_size: imageSize,
    },
  };

  // Kie.ai 不支持 num_images 参数，每次只生成一张图
  // 如果需要多张图，需要多次调用
  if (numImages > 1) {
    console.warn("Kie.ai only supports generating 1 image per request, ignoring num_images parameter");
  }

  return await createKieTask(request);
}

// 提交图像编辑任务
export async function submitImageEdit(
  prompt: string,
  imageUrls: string[],
  numImages: number = 1,
  webhookUrl?: string,
  imageSize: string = "auto",
  outputFormat: string = "png"
): Promise<string> {
  const request: KieApiRequest = {
    model: "google/nano-banana-edit",
    callBackUrl: webhookUrl,
    input: {
      prompt,
      image_urls: imageUrls,
      output_format: outputFormat,
      image_size: imageSize,
    },
  };

  // Kie.ai 不支持 num_images 参数，每次只生成一张图
  if (numImages > 1) {
    console.warn("Kie.ai only supports generating 1 image per request, ignoring num_images parameter");
  }

  return await createKieTask(request);
}