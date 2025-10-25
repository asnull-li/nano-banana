// Wan 2.5 Workspace Types

export type Wan25TaskType = "text-to-video" | "image-to-video";
export type Wan25Duration = "5" | "10";
export type Wan25Resolution = "720p" | "1080p";
export type Wan25AspectRatio = "16:9" | "9:16" | "1:1";
export type TaskStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "completed"
  | "failed";

export interface Wan25Task {
  id: string;
  status: TaskStatus;
  type: Wan25TaskType;
  prompt: string;
  duration: Wan25Duration;
  resolution: Wan25Resolution;
  aspectRatio?: Wan25AspectRatio; // 仅 text-to-video 模式
  negativePrompt?: string;
  seed?: number;
  inputImage: string | null; // For image-to-video mode
  videoUrl: string | null;
  error?: string;
  // 用于URL模式
  isUrlMode?: boolean;
  originalFileName?: string;
}

export interface Wan25WorkspaceProps {
  className?: string;
  pageData?: any;
  initialImageUrl?: string | null;
}

export interface GenerateVideoParams {
  type: Wan25TaskType;
  prompt: string;
  duration: Wan25Duration;
  resolution: Wan25Resolution;
  image_url?: string;
  aspect_ratio?: Wan25AspectRatio;
  negative_prompt?: string;
  enable_prompt_expansion?: boolean;
  seed?: number;
}
