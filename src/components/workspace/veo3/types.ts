// Veo3 Workspace Types

export type Veo3Model = "veo3" | "veo3_fast";
export type Veo3TaskType = "text-to-video" | "image-to-video";
export type AspectRatio = "16:9" | "9:16" | "Auto";
export type TaskStatus = "idle" | "uploading" | "processing" | "completed" | "failed";

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
  imageUrls?: string[];
  aspectRatio?: AspectRatio;
  watermark?: string;
  seeds?: number;
}
