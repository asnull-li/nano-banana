// Veo3 视频生成相关常量配置
// 这个文件可以在客户端和服务器端使用

// 每个视频消耗的积分数
export const CREDITS_PER_VEO3_FAST = 50; // veo3_fast 模型
export const CREDITS_PER_VEO3_QUALITY = 180; // veo3 模型（高质量）
export const CREDITS_PER_1080P = 8; // 升级到 1080P

// 视频模型类型
export type Veo3Model = "veo3" | "veo3_fast";

// 任务类型
export type Veo3TaskType = "text-to-video" | "image-to-video";

// 宽高比选项
export type AspectRatio = "16:9" | "9:16" | "Auto";

// 默认配置
export const DEFAULT_VEO3_MODEL: Veo3Model = "veo3_fast";
export const DEFAULT_ASPECT_RATIO: AspectRatio = "16:9";

// 支持 1080P 的宽高比（只有 16:9 支持）
export const ASPECT_RATIOS_SUPPORT_1080P: AspectRatio[] = ["16:9"];

// 提示词长度限制
export const MIN_PROMPT_LENGTH = 3;
export const MAX_PROMPT_LENGTH = 2000;

// 图片URL数量限制（image-to-video 模式）
export const MAX_IMAGE_URLS = 1; // Veo3 目前支持1张图片

// 根据模型获取积分消耗
export function getCreditsForModel(model: Veo3Model): number {
  return model === "veo3" ? CREDITS_PER_VEO3_QUALITY : CREDITS_PER_VEO3_FAST;
}

// 检查宽高比是否支持 1080P
export function supports1080p(aspectRatio: AspectRatio): boolean {
  return ASPECT_RATIOS_SUPPORT_1080P.includes(aspectRatio);
}
