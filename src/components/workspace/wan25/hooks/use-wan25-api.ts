"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useR2Upload } from "@/hooks/use-r2-upload";
import {
  Wan25TaskType,
  Wan25AspectRatio,
  Wan25Duration,
  Wan25Resolution,
} from "../types";

export interface GenerateVideoRequest {
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

export interface GenerateVideoResponse {
  success: boolean;
  task_id: string;
  request_id: string;
  credits_used: number;
  remaining_credits: number;
  error?: string;
}

export interface TaskStatusResponse {
  success: boolean;
  task: {
    task_id: string;
    status: "processing" | "completed" | "failed";
    type: Wan25TaskType;
    input: {
      prompt: string;
      duration: Wan25Duration;
      resolution: Wan25Resolution;
      aspect_ratio?: Wan25AspectRatio;
      image_url?: string;
      negative_prompt?: string;
      enable_prompt_expansion?: boolean;
      seed?: number;
    };
    result?: {
      resultUrls: string[];
    };
    video_url?: string;
    credits_used: number;
    error_message?: string;
    error_code?: string;
    created_at: string;
    completed_at?: string;
  };
}

export function useWan25API() {
  const [isLoading, setIsLoading] = useState(false);

  // 使用统一的客户端上传
  const { uploadWithValidation } = useR2Upload({
    onError: (error) => {
      console.error("Upload error in wan25:", error);
      toast.error(error);
    },
  });

  // Upload image to R2 storage (for image-to-video)
  const uploadImage = useCallback(
    async (file: File): Promise<string> => {
      const result = await uploadWithValidation(file);

      if (!result.success) {
        throw new Error(result.error || "Failed to upload image");
      }

      return result.url!;
    },
    [uploadWithValidation]
  );

  // Submit video generation task
  const submitVideoTask = useCallback(
    async (request: GenerateVideoRequest): Promise<string> => {
      setIsLoading(true);

      try {
        const response = await fetch("/api/wan25/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        });

        const data: GenerateVideoResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to submit video generation task");
        }

        return data.task_id;
      } catch (error) {
        console.error("Submit video task error:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Get task status
  const getTaskStatus = useCallback(
    async (taskId: string): Promise<TaskStatusResponse> => {
      try {
        const response = await fetch(`/api/wan25/status/${taskId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data: TaskStatusResponse = await response.json();

        if (!data.success) {
          throw new Error("Failed to get task status");
        }

        return data;
      } catch (error) {
        console.error("Get task status error:", error);
        throw error;
      }
    },
    []
  );

  return {
    // Core API methods
    uploadImage,
    submitVideoTask,
    getTaskStatus,

    // State
    isLoading,
  };
}
