"use client";

import { useState } from "react";
import { toast } from "sonner";

interface GenerateOptions {
  prompt: string;
  model?: "flux-kontext-pro" | "flux-kontext-max";
  size?: string;
  count?: number;
}

interface EditOptions {
  prompt: string;
  imageUrl: string;
  model?: "flux-kontext-pro" | "flux-kontext-max";
  strength?: number;
}

export function useFluxAPI() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  /**
   * Upload image to R2
   */
  const uploadImage = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Upload failed");
      }

      return data.url;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
      throw error;
    }
  };

  /**
   * Generate image from text
   */
  const generateImage = async (options: GenerateOptions) => {
    setIsGenerating(true);
    setProgress(0);

    try {
      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch("/api/flux/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      });

      const data = await response.json();
      clearInterval(progressInterval);

      if (!data.success) {
        throw new Error(data.error?.message || "Generation failed");
      }

      // If we got task_id, it's async - we need to poll or wait for callback
      if (data.task_id && !data.data) {
        setTaskId(data.task_id);
        toast.info("Image generation started. This may take 1-2 minutes...");
        
        // Poll for result
        const result = await pollForResult(data.task_id);
        setProgress(100);
        return result;
      }

      // Direct result
      setProgress(100);
      toast.success("Image generated successfully!");
      return data.data;
    } catch (error) {
      console.error("Generate error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate image");
      throw error;
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setTaskId(null);
    }
  };

  /**
   * Edit existing image
   */
  const editImage = async (options: EditOptions) => {
    setIsGenerating(true);
    setProgress(0);

    try {
      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch("/api/flux/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      });

      const data = await response.json();
      clearInterval(progressInterval);

      if (!data.success) {
        throw new Error(data.error?.message || "Edit failed");
      }

      // If we got task_id, it's async
      if (data.task_id && !data.data) {
        setTaskId(data.task_id);
        toast.info("Image editing started. This may take 1-2 minutes...");
        
        // Poll for result
        const result = await pollForResult(data.task_id);
        setProgress(100);
        return result;
      }

      // Direct result
      setProgress(100);
      toast.success("Image edited successfully!");
      return data.data;
    } catch (error) {
      console.error("Edit error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to edit image");
      throw error;
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setTaskId(null);
    }
  };

  /**
   * Poll for async task result using Flux tasks API
   */
  const pollForResult = async (taskId: string, maxAttempts = 60, interval = 2000) => {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, interval));

      try {
        const response = await fetch("/api/flux/task", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ taskId }),
        });
        
        const data = await response.json();

        if (data.success && data.completed && data.data) {
          return data.data;
        }
        
        // Update progress based on actual status if available
        if (data.progress) {
          setProgress(Math.min(90, data.progress));
        } else {
          // Update progress gradually
          setProgress(Math.min(90, 30 + i));
        }
      } catch (error) {
        console.error("Poll error:", error);
      }
    }

    throw new Error("Task timeout - please try again");
  };

  return {
    isGenerating,
    taskId,
    progress,
    uploadImage,
    generateImage,
    editImage,
  };
}