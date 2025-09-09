// Upscaler 相关常量配置

// 每次图片放大消耗的积分数
export const CREDITS_PER_UPSCALE = 2;

// 支持的放大倍数范围
export const MIN_SCALE = 1;
export const MAX_SCALE = 4;
export const DEFAULT_SCALE = 2;

// 输入参数接口
export interface UpscalerInput {
  image: string;
  scale?: number;
  face_enhance?: boolean;
}

// 任务状态类型
export type UpscalerTaskStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";
