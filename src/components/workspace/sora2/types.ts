// Sora 2 Workspace Types

export type Sora2TaskType = "text-to-video" | "image-to-video";
export type Sora2AspectRatio = "landscape" | "portrait";
export type Sora2Model = "sora2" | "sora2-pro";
export type Sora2Duration = "10" | "15";
export type Sora2Quality = "standard" | "high";
export type TaskStatus = "idle" | "uploading" | "processing" | "completed" | "failed";

export interface Sora2Task {
  id: string;
  status: TaskStatus;
  type: Sora2TaskType;
  model: Sora2Model;
  prompt: string;
  aspectRatio: Sora2AspectRatio;
  removeWatermark: boolean;
  duration?: Sora2Duration; // 仅 Pro 版本
  quality?: Sora2Quality; // 仅 Pro 版本
  inputImage: string | null; // For image-to-video mode
  videoUrl: string | null;
  error?: string;
  // 用于URL模式
  isUrlMode?: boolean;
  originalFileName?: string;
}

export interface Sora2WorkspaceProps {
  className?: string;
  initialImageUrl?: string | null;
}

export interface GenerateVideoParams {
  model: Sora2Model;
  type: Sora2TaskType;
  prompt: string;
  image_urls?: string[];
  aspect_ratio?: Sora2AspectRatio;
  remove_watermark?: boolean;
  n_frames?: Sora2Duration; // 仅 Pro 版本
  size?: Sora2Quality; // 仅 Pro 版本
}
