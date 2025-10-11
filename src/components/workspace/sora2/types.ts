// Sora 2 Workspace Types

export type Sora2TaskType = "text-to-video" | "image-to-video";
export type Sora2AspectRatio = "landscape" | "portrait";
export type TaskStatus = "idle" | "uploading" | "processing" | "completed" | "failed";

export interface Sora2Task {
  id: string;
  status: TaskStatus;
  type: Sora2TaskType;
  prompt: string;
  aspectRatio: Sora2AspectRatio;
  removeWatermark: boolean;
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
  type: Sora2TaskType;
  prompt: string;
  image_urls?: string[];
  aspect_ratio?: Sora2AspectRatio;
  remove_watermark?: boolean;
}
