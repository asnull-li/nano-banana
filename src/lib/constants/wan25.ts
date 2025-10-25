// Wan 2.5 视频生成相关常量配置

// 任务类型
export type Wan25TaskType = "text-to-video" | "image-to-video";

// 时长选项
export type Wan25Duration = "5" | "10";

// 分辨率选项
export type Wan25Resolution = "720p" | "1080p";

// 宽高比选项 (仅 text-to-video)
export type Wan25AspectRatio = "16:9" | "9:16" | "1:1";

// 默认配置
export const DEFAULT_DURATION: Wan25Duration = "5";
export const DEFAULT_RESOLUTION: Wan25Resolution = "720p";
export const DEFAULT_ASPECT_RATIO: Wan25AspectRatio = "16:9";

// 提示词长度限制
export const MIN_PROMPT_LENGTH = 3;
export const MAX_PROMPT_LENGTH = 800;

// 负面提示词长度限制
export const MAX_NEGATIVE_PROMPT_LENGTH = 500;

// 积分计算函数
// 规则: 5s 720p = 60, 5s 1080p = 100, 10s 720p = 120, 10s 1080p = 200
export function calculateCredits(
  duration: Wan25Duration,
  resolution: Wan25Resolution
): number {
  const creditsMatrix: Record<
    Wan25Duration,
    Record<Wan25Resolution, number>
  > = {
    "5": {
      "720p": 60,
      "1080p": 100,
    },
    "10": {
      "720p": 120,
      "1080p": 200,
    },
  };

  return creditsMatrix[duration][resolution];
}
