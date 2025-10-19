// Sora 2 视频生成相关常量配置

// 每个视频消耗的积分数（Sora 2 普通版）
export const CREDITS_PER_SORA2 = 10;

// 任务类型
export type Sora2TaskType = "text-to-video" | "image-to-video";

// 模型类型
export type Sora2Model = "sora2" | "sora2-pro";

// 时长选项（仅 Sora 2 Pro）
export type Sora2Duration = "10" | "15";

// 画质选项（仅 Sora 2 Pro）
export type Sora2Quality = "standard" | "high";

// 宽高比选项 (使用 KIE Jobs API 的格式)
export type Sora2AspectRatio = "landscape" | "portrait";

// 默认配置
export const DEFAULT_MODEL: Sora2Model = "sora2";
export const DEFAULT_DURATION: Sora2Duration = "10";
export const DEFAULT_QUALITY: Sora2Quality = "standard";
export const DEFAULT_ASPECT_RATIO: Sora2AspectRatio = "landscape";
export const DEFAULT_REMOVE_WATERMARK = false;

// 提示词长度限制
export const MIN_PROMPT_LENGTH = 3;
export const MAX_PROMPT_LENGTH = 5000;

// 图片URL数量限制（image-to-video 模式）
export const MAX_IMAGE_URLS = 1; // Sora 2 支持1张图片

// 动态计算积分（支持双版本）
export function calculateCredits(
  model: Sora2Model,
  duration?: Sora2Duration,
  quality?: Sora2Quality,
  removeWatermark?: boolean
): number {
  const selectedDuration = duration || DEFAULT_DURATION;
  const selectedQuality = quality || DEFAULT_QUALITY;
  const watermarkEnabled = removeWatermark ?? DEFAULT_REMOVE_WATERMARK;

  // Sora 2 普通版：根据时长和水印计算
  // 10s + 水印移除 = 10 积分, 不移除 = 8 积分
  // 15s + 水印移除 = 12 积分, 不移除 = 10 积分
  if (model === "sora2") {
    const baseCredits = selectedDuration === "10" ? 10 : 12;
    const watermarkDiscount = watermarkEnabled ? 0 : 2;
    return baseCredits - watermarkDiscount;
  }

  // Sora 2 Pro：根据时长和画质计算(不受水印参数影响)
  // 标准画质: 10秒=40, 15秒=50
  // 高画质: 10秒=80, 15秒=160
  const creditsMatrix: Record<Sora2Quality, Record<Sora2Duration, number>> = {
    standard: {
      "10": 40,
      "15": 50,
    },
    high: {
      "10": 80,
      "15": 160,
    },
  };

  return creditsMatrix[selectedQuality][selectedDuration];
}
