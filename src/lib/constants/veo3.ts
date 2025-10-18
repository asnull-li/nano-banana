// Veo3 视频生成相关常量配置
// 这个文件可以在客户端和服务器端使用

// 每个视频消耗的积分数
export const CREDITS_PER_VEO3_FAST = 30; // veo3_fast 模型
export const CREDITS_PER_VEO3_QUALITY = 130; // veo3 模型（高质量）
export const CREDITS_PER_1080P = 10; // 升级到 1080P

// 视频模型类型
export type Veo3Model = "veo3" | "veo3_fast";

// 任务类型
export type Veo3TaskType = "text-to-video" | "image-to-video";

// 宽高比选项
export type AspectRatio = "16:9" | "9:16" | "Auto";

// 视频生成模式类型（仅用于 image-to-video）
export type GenerationType =
  | "TEXT_2_VIDEO"              // 文生视频（仅供 KIE API 使用，前端不需要传）
  | "FIRST_AND_LAST_FRAMES_2_VIDEO"  // 首尾帧生视频（1-2张图）
  | "REFERENCE_2_VIDEO";        // 参考图生视频（1-3张图，仅 veo3_fast + 16:9）

// 默认配置
export const DEFAULT_VEO3_MODEL: Veo3Model = "veo3_fast";
export const DEFAULT_ASPECT_RATIO: AspectRatio = "16:9";
export const DEFAULT_IMAGE_TO_VIDEO_GENERATION_TYPE: GenerationType = "FIRST_AND_LAST_FRAMES_2_VIDEO";

// 支持 1080P 的宽高比（只有 16:9 支持）
export const ASPECT_RATIOS_SUPPORT_1080P: AspectRatio[] = ["16:9"];

// 提示词长度限制
export const MIN_PROMPT_LENGTH = 3;
export const MAX_PROMPT_LENGTH = 2000;

// 图片URL数量限制（image-to-video 模式）
export const MAX_IMAGE_URLS = 3; // 最大支持3张（REFERENCE_2_VIDEO 模式）

// 根据模型获取积分消耗
export function getCreditsForModel(model: Veo3Model): number {
  return model === "veo3" ? CREDITS_PER_VEO3_QUALITY : CREDITS_PER_VEO3_FAST;
}

// 检查宽高比是否支持 1080P
export function supports1080p(aspectRatio: AspectRatio): boolean {
  return ASPECT_RATIOS_SUPPORT_1080P.includes(aspectRatio);
}

// 根据 generationType 获取图片数量限制
export function getImageUrlsLimit(generationType?: GenerationType): { min: number; max: number } {
  if (generationType === "REFERENCE_2_VIDEO") {
    return { min: 1, max: 3 };
  }
  // FIRST_AND_LAST_FRAMES_2_VIDEO 或未指定
  return { min: 1, max: 2 };
}

// 校验 generationType 的模型和宽高比限制
export function validateGenerationType(
  generationType: GenerationType,
  model: Veo3Model,
  aspectRatio: AspectRatio
): { valid: boolean; error?: string } {
  if (generationType === "REFERENCE_2_VIDEO") {
    if (model !== "veo3_fast") {
      return {
        valid: false,
        error: "REFERENCE_2_VIDEO mode only supports veo3_fast model"
      };
    }
    if (aspectRatio !== "16:9") {
      return {
        valid: false,
        error: "REFERENCE_2_VIDEO mode only supports 16:9 aspect ratio"
      };
    }
  }
  return { valid: true };
}
