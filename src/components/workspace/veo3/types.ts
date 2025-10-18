// Veo3 Workspace Types

export type Veo3Model = "veo3" | "veo3_fast";
export type Veo3TaskType = "text-to-video" | "image-to-video";
export type AspectRatio = "16:9" | "9:16" | "Auto";
export type TaskStatus = "idle" | "uploading" | "processing" | "completed" | "failed";

// 前端 UI 模式选择（包含 3 个选项）
export type ModeOption = "text-to-video" | "image-to-video" | "reference-to-video";

// 视频生成类型（用于区分图生视频的不同模式）
export type GenerationType = "FIRST_AND_LAST_FRAMES_2_VIDEO" | "REFERENCE_2_VIDEO";

export interface Veo3Task {
  id: string;
  status: TaskStatus;
  type: Veo3TaskType;
  prompt: string;
  model: Veo3Model;
  aspectRatio: AspectRatio;
  inputImage: string | null;
  video720pUrl: string | null;
  video1080pUrl: string | null;
  has1080p: boolean;
  canUpgradeTo1080p: boolean;
  watermark?: string;
  seeds?: number;
  error?: string;
  // 用于URL模式
  isUrlMode?: boolean;
  originalFileName?: string;
}

export interface Veo3WorkspaceProps {
  className?: string;
  initialImageUrl?: string | null;
}

export interface GenerateVideoParams {
  type: Veo3TaskType;
  prompt: string;
  model: Veo3Model;
  image_urls?: string[];
  aspect_ratio?: AspectRatio;
  watermark?: string;
  seeds?: number;
  enable_translation?: boolean;
  generation_type?: GenerationType;
}
