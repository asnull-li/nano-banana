// Sora 2 视频生成相关常量配置

// 每个视频消耗的积分数
export const CREDITS_PER_SORA2 = 15;

// 任务类型
export type Sora2TaskType = "text-to-video" | "image-to-video";

// 宽高比选项 (使用 KIE Jobs API 的格式)
export type Sora2AspectRatio = "landscape" | "portrait";

// 默认配置
export const DEFAULT_ASPECT_RATIO: Sora2AspectRatio = "landscape";
export const DEFAULT_REMOVE_WATERMARK = true;

// 提示词长度限制
export const MIN_PROMPT_LENGTH = 3;
export const MAX_PROMPT_LENGTH = 5000;

// 图片URL数量限制（image-to-video 模式）
export const MAX_IMAGE_URLS = 1; // Sora 2 支持1张图片

// 根据任务类型获取积分消耗（Sora 2 所有类型都是固定15积分）
export function getCreditsForTask(type: Sora2TaskType): number {
  return CREDITS_PER_SORA2;
}
