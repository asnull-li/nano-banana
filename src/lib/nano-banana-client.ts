import { fal } from "@fal-ai/client";

// 配置客户端使用proxy
fal.config({
  proxyUrl: "/api/fal/proxy",
});

// 提交文本生成图像任务
export async function submitTextToImage(
  prompt: string,
  numImages: number = 1,
  webhookUrl?: string
): Promise<string> {
  const { request_id } = await fal.queue.submit("fal-ai/nano-banana", {
    input: {
      prompt,
      num_images: numImages,
    },
    webhookUrl,
  });
  return request_id;
}

// 提交图像编辑任务
export async function submitImageEdit(
  prompt: string,
  imageUrls: string[],
  numImages: number = 1,
  webhookUrl?: string
): Promise<string> {
  const res = await fal.queue.submit("fal-ai/nano-banana/edit", {
    input: {
      prompt,
      image_urls: imageUrls,
      num_images: numImages,
    },
    webhookUrl,
  });
  console.log("Edit task submitted result:", res);
  return res.request_id;
}

// 查询任务状态
export async function getTaskStatus(
  requestId: string,
  type: "text-to-image" | "image-to-image"
) {
  const endpoint =
    type === "text-to-image" ? "fal-ai/nano-banana" : "fal-ai/nano-banana/edit";

  return await fal.queue.status(endpoint, {
    requestId,
    logs: true,
  });
}

// 获取任务结果
export async function getTaskResult(
  requestId: string,
  type: "text-to-image" | "image-to-image"
) {
  const endpoint =
    type === "text-to-image" ? "fal-ai/nano-banana" : "fal-ai/nano-banana/edit";

  return await fal.queue.result(endpoint, {
    requestId,
  });
}
