"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Helper function to handle API errors, especially insufficient credits
  const handleApiError = (response: Response, data: any) => {
    if (response.status === 402 && data.error === "insufficient_credits") {
      toast.error(data.message, {
        duration: 5000,
        action: {
          label: "Get Credits",
          onClick: () => router.push("/pricing"),
        },
      });
      return true; // Handled
    }
    return false; // Not handled
  };

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
        setProgress((prev) => Math.min(prev + 10, 60));
      }, 5000);

      toast.info("Image generation started. This may take 1-2 minutes...");

      // 等待50秒
      await new Promise((resolve) => setTimeout(resolve, 50000));

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
        // Handle specific error cases
        if (handleApiError(response, data)) {
          throw new Error("Credits required"); // This will be caught but not shown as toast
        }
        throw new Error(
          data.error?.message || data.message || "Generation failed"
        );
      }
      setProgress(70);
      // If we got task_id, it's async - we need to poll or wait for callback
      if (data.task_id && !data.data) {
        setTaskId(data.task_id);
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
      // Don't show toast for credits required error as it's already handled
      if (error instanceof Error && error.message !== "Credits required") {
        toast.error(error.message || "Failed to generate image");
      }
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
        setProgress((prev) => Math.min(prev + 10, 60));
      }, 5000);

      toast.info("Image editing started. This may take 1-2 minutes...");

      // 等待50秒
      await new Promise((resolve) => setTimeout(resolve, 50000));

      const response = await fetch("/api/flux/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      });

      const data = await response.json();
      clearInterval(progressInterval);
      setProgress(70);

      if (!data.success) {
        // Handle specific error cases
        if (handleApiError(response, data)) {
          throw new Error("Credits required"); // This will be caught but not shown as toast
        }
        throw new Error(data.error?.message || data.message || "Edit failed");
      }

      // If we got task_id, it's async
      if (data.task_id && !data.data) {
        setTaskId(data.task_id);

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
      // Don't show toast for credits required error as it's already handled
      if (error instanceof Error && error.message !== "Credits required") {
        toast.error(error.message || "Failed to edit image");
      }
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
  const pollForResult = async (
    taskId: string,
    maxAttempts = 60,
    interval = 6000
  ) => {
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

        // Check if task failed (error field exists)
        if (data.error) {
          const errorMessage = data.error.message || "Task execution failed";
          const errorCode = data.error.code || "unknown_error";
          
          // Show detailed error message to user
          toast.error(`Image processing failed: ${errorMessage}`, {
            description: `Error code: ${errorCode}`,
            duration: 8000,
          });
          
          throw new Error(errorMessage);
        }

        // Check if task completed successfully
        if (data.success && data.completed && data.data) {
          return data.data;
        }

        // Update progress based on actual status if available
        if (data.progress) {
          setProgress(Math.min(90, data.progress));
        } else {
          // Update progress gradually
          setProgress(95);
        }
      } catch (error) {
        console.error("Poll error:", error);
        // Re-throw the error to be handled by the caller
        if (error instanceof Error) {
          throw error;
        }
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
