"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { UpscalerInput } from "@/lib/constants/upscaler";
import { useR2Upload } from "@/hooks/use-r2-upload";

export interface UpscaleRequest {
  input: UpscalerInput;
}

export interface UpscaleResponse {
  success: boolean;
  task_id: string;
  request_id: string;
  credits_used: number;
  remaining_credits: number;
  error?: string;
}

export interface TaskStatusResponse {
  success: boolean;
  task_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  input?: UpscalerInput;
  provider?: string;
  result?: {
    images: Array<{ url: string }>;
  };
  credits_used?: number;
  completed_at?: string;
  error?: string;
}

export function useUpscalerAPI() {
  const [isLoading, setIsLoading] = useState(false);

  // 使用统一的客户端上传
  const { uploadWithValidation } = useR2Upload({
    onError: (error) => {
      console.error("Upload error in upscaler:", error);
      toast.error(error);
    }
  });

  // Upload image to R2 storage
  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const result = await uploadWithValidation(file);

    if (!result.success) {
      throw new Error(result.error || "Failed to upload image");
    }

    return result.url!;
  }, [uploadWithValidation]);

  // Submit upscale task
  const submitUpscaleTask = useCallback(async (request: UpscaleRequest): Promise<string> => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/upscaler/kie/summit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const data: UpscaleResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to submit upscale task");
      }

      return data.task_id;
    } catch (error) {
      console.error("Submit upscale task error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get task status
  const getTaskStatus = useCallback(async (taskId: string): Promise<TaskStatusResponse> => {
    try {
      const response = await fetch(`/api/upscaler/status/${taskId}`, {
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
  }, []);

  // Get task result (alternative to status polling)
  const getTaskResult = useCallback(async (taskId: string): Promise<TaskStatusResponse> => {
    try {
      const response = await fetch(`/api/upscaler/result/${taskId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!data.success) {
        // Task might still be processing
        if (response.status === 202) {
          throw new Error("Task is still processing");
        }
        throw new Error(data.error || "Failed to get task result");
      }

      return data;
    } catch (error) {
      console.error("Get task result error:", error);
      throw error;
    }
  }, []);

  // Complete upscale workflow with automatic status polling
  const upscaleImage = useCallback(async (
    file: File,
    options: { scale?: number; face_enhance?: boolean } = {}
  ): Promise<{ originalUrl: string; upscaledUrl: string }> => {
    try {
      setIsLoading(true);

      // 1. Upload image
      toast.info("Uploading image...");
      const imageUrl = await uploadImage(file);

      // 2. Submit upscale task
      toast.info("Starting upscale process...");
      const taskId = await submitUpscaleTask({
        input: {
          image: imageUrl,
          scale: options.scale || 2,
          face_enhance: options.face_enhance || false,
        },
      });

      // 3. Poll for completion
      toast.info("Processing image...");
      return new Promise((resolve, reject) => {
        const pollStatus = async () => {
          try {
            const status = await getTaskStatus(taskId);

            if (status.status === "completed" && status.result?.images?.[0]?.url) {
              resolve({
                originalUrl: imageUrl,
                upscaledUrl: status.result.images[0].url,
              });
              return;
            }

            if (status.status === "failed") {
              reject(new Error(status.error || "Upscale failed"));
              return;
            }

            // Continue polling
            setTimeout(pollStatus, 2000);
          } catch (error) {
            // Retry on error, but with longer delay
            setTimeout(pollStatus, 5000);
          }
        };

        // Start polling after initial delay
        setTimeout(pollStatus, 2000);
      });

    } catch (error) {
      console.error("Upscale image workflow error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [uploadImage, submitUpscaleTask, getTaskStatus]);

  return {
    // Core API methods
    uploadImage,
    submitUpscaleTask,
    getTaskStatus,
    getTaskResult,
    
    // Complete workflow
    upscaleImage,
    
    // State
    isLoading,
  };
}