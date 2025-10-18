"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useR2Upload } from "@/hooks/use-r2-upload";
import { Veo3Model, Veo3TaskType, AspectRatio, GenerationType } from "../types";

export interface GenerateVideoRequest {
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
    status: "pending" | "processing" | "completed" | "failed";
    type: Veo3TaskType;
    model: Veo3Model;
    input: {
      prompt: string;
      aspect_ratio: AspectRatio;
      watermark?: string;
    };
    result?: {
      resolution: string;
      result_urls: string[];
      origin_urls?: string[];
    };
    video_720p_url?: string;
    video_1080p_url?: string;
    has_1080p: boolean;
    can_upgrade_to_1080p: boolean;
    credits_used: number;
    error_message?: string;
    error_code?: string;
    created_at: string;
    completed_at?: string;
  };
}

export interface Upgrade1080pResponse {
  success: boolean;
  video_1080p_url?: string;
  credits_used?: number;
  remaining_credits?: number;
  error?: string;
  message?: string;
}

export function useVeo3API() {
  const [isLoading, setIsLoading] = useState(false);

  // 使用统一的客户端上传
  const { uploadWithValidation } = useR2Upload({
    onError: (error) => {
      console.error("Upload error in veo3:", error);
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
        const response = await fetch("/api/veo3/submit", {
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
        const response = await fetch(`/api/veo3/status/${taskId}`, {
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

  // Upgrade to 1080P
  const upgrade1080p = useCallback(async (taskId: string, index?: number): Promise<string> => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/veo3/get1080p", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task_id: taskId, index }),
      });

      const data: Upgrade1080pResponse = await response.json();

      if (!data.success) {
        // 如果是 PROCESSING 错误，添加特殊标记
        if (data.error === "PROCESSING") {
          const error = new Error(data.message || "1080P video is still processing");
          (error as any).code = "PROCESSING";
          throw error;
        }

        // 其他错误
        throw new Error(data.error || "Failed to upgrade to 1080P");
      }

      return data.video_1080p_url!;
    } catch (error) {
      // 只记录非 PROCESSING 的错误
      if ((error as any).code !== "PROCESSING") {
        console.error("Upgrade 1080P error:", error);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // Core API methods
    uploadImage,
    submitVideoTask,
    getTaskStatus,
    upgrade1080p,

    // State
    isLoading,
  };
}
