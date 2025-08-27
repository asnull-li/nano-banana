"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

export type GenerationMode = "text-to-image" | "image-to-image";

export type TaskStatus = "idle" | "uploading" | "processing" | "fetching" | "completed" | "failed";

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  uploadProgress: number;
  url?: string;
}

export interface GenerationResult {
  url: string;
  seed?: number;
  width?: number;
  height?: number;
}

interface UseNanoBananaOptions {
  onComplete?: (results: GenerationResult[]) => void;
  onError?: (error: string) => void;
}

export function useNanoBanana(options: UseNanoBananaOptions = {}) {
  const { onComplete, onError } = options;

  const [mode, setMode] = useState<GenerationMode>("text-to-image");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [numImages, setNumImages] = useState(1);
  const [status, setStatus] = useState<TaskStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [aiDescription, setAiDescription] = useState<string>("");

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 上传单个图片到 R2
  const uploadImageToR2 = async (file: File, imageId: string): Promise<string> => {
    try {
      // 更新上传进度 - 开始上传
      setUploadedImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, uploadProgress: 30 } : img)));

      const formData = new FormData();
      formData.append("file", file);

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadedImages((prev) =>
          prev.map((img) => {
            if (img.id === imageId && img.uploadProgress < 90) {
              return { ...img, uploadProgress: img.uploadProgress + 10 };
            }
            return img;
          })
        );
      }, 200);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Upload failed");
      }

      // 更新上传完成状态
      setUploadedImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, uploadProgress: 100, url: data.url } : img))
      );

      return data.url;
    } catch (error) {
      console.error("Upload error:", error);
      // 重置上传进度
      setUploadedImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, uploadProgress: 0 } : img)));
      throw error;
    }
  };

  // 批量上传图片 - 逐个上传并显示进度
  const uploadAllImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    let uploadedCount = 0;

    for (const image of uploadedImages) {
      if (image.url) {
        urls.push(image.url);
        uploadedCount++;
      } else {
        try {
          const url = await uploadImageToR2(image.file, image.id);
          urls.push(url);
          uploadedCount++;

          // 更新总体进度
          const overallProgress = Math.round((uploadedCount / uploadedImages.length) * 15) + 5;
          setProgress(overallProgress);
        } catch (error) {
          throw new Error(`Failed to upload image ${image.file.name}`);
        }
      }
    }

    return urls;
  };

  // 添加图片到上传列表 - 不设置上传进度，避免闪烁
  const addImages = useCallback(
    (files: File[]) => {
      const newImages: UploadedImage[] = files.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        uploadProgress: 0, // 初始为0，不触发动画
      }));

      setUploadedImages((prev) => {
        const updated = [...prev, ...newImages];
        // 限制最多10张图片
        return updated.slice(0, 10);
      });

      // 如果超过10张，提示用户
      if (uploadedImages.length + files.length > 10) {
        toast.warning("Maximum 10 images allowed, automatically limited");
      }
    },
    [uploadedImages.length]
  );

  // 移除图片
  const removeImage = useCallback((imageId: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
  }, []);

  // 清空所有图片
  const clearImages = useCallback(() => {
    // 清理预览URL
    uploadedImages.forEach((img) => {
      if (img.preview.startsWith("blob:")) {
        URL.revokeObjectURL(img.preview);
      }
    });
    setUploadedImages([]);
  }, [uploadedImages]);

  // 获取任务结果
  const getTaskResult = async (taskId: string) => {
    try {
      const response = await fetch(`/api/nano-banana/result/${taskId}`);
      const data = await response.json();

      if (data.success && data.data?.images) {
        const results: GenerationResult[] = data.data.images.map((img: any) => ({
          url: img.url,
          seed: img.seed,
          width: img.width,
          height: img.height,
        }));

        // 保存AI描述
        if (data.data.description) {
          setAiDescription(data.data.description);
        }

        setResults(results);
        setStatus("completed");
        setProgress(100);

        toast.success(`Successfully generated ${results.length} images!`);
        onComplete?.(results);
      } else {
        throw new Error(data.error || "Failed to get results");
      }
    } catch (error) {
      console.error("Failed to get result:", error);
      setStatus("failed");
      const errorMsg = error instanceof Error ? error.message : "Failed to get results";
      toast.error(errorMsg);
      onError?.(errorMsg);
    }
  };

  // 轮询任务状态
  const pollTaskStatus = (taskId: string) => {
    // 清除之前的轮询
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/nano-banana/status/${taskId}`);
        const data = await response.json();

        // 更新进度（留10%给获取结果）
        if (data.progress !== undefined) {
          const progressPercent = Math.min(data.progress * 0.9, 90);
          setProgress(progressPercent);
        }

        // 检查状态
        if (data.status === "COMPLETED") {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }

          setProgress(95);
          setStatus("fetching");

          // 获取最终结果
          await getTaskResult(taskId);
        }

        if (data.status === "FAILED") {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }

          setStatus("failed");
          const errorMsg = data.error || "Task execution failed";
          toast.error(errorMsg);
          onError?.(errorMsg);
        }
      } catch (error) {
        console.error("Status polling error:", error);
        // 继续轮询，不立即停止
      }
    }, 5000); // 每2秒轮询一次
  };

  // 提交生成任务
  const submitTask = async () => {
    try {
      // 验证输入
      if (!prompt.trim()) {
        toast.error("Please enter a prompt");
        return;
      }

      if (mode === "image-to-image" && uploadedImages.length === 0) {
        toast.error("Please upload at least one image");
        return;
      }

      // 重置状态
      setStatus("uploading");
      setProgress(5);
      setResults([]);
      setTaskId(null);

      // 上传图片（仅图生图模式）
      let imageUrls: string[] = [];
      if (mode === "image-to-image") {
        try {
          toast.info(`Starting to upload ${uploadedImages.length} images...`);
          imageUrls = await uploadAllImages();
          setProgress(20);
          toast.success("All images uploaded successfully!");
        } catch (error) {
          setStatus("failed");
          const errorMsg = error instanceof Error ? error.message : "Image upload failed";
          toast.error(errorMsg);
          onError?.(errorMsg);
          return;
        }
      }

      // 提交任务
      setStatus("processing");
      const response = await fetch("/api/nano-banana/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: mode,
          prompt: prompt.trim(),
          image_urls: mode === "image-to-image" ? imageUrls : undefined,
          num_images: numImages,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to submit task");
      }

      // 保存任务ID
      setTaskId(data.task_id);
      setProgress(30);

      toast.info("Task submitted, processing...");

      // 开始轮询状态
      pollTaskStatus(data.task_id);
    } catch (error) {
      setStatus("failed");
      const errorMsg = error instanceof Error ? error.message : "Failed to submit task";

      // 特殊处理积分不足的情况
      if (errorMsg.includes("Insufficient credits")) {
        toast.error("Insufficient credits, please recharge and try again");
      } else {
        toast.error(errorMsg);
      }

      onError?.(errorMsg);
    }
  };

  // 取消任务
  const cancelTask = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    setStatus("idle");
    setProgress(0);
    setTaskId(null);

    // toast.info("任务已取消");
  }, []);

  // 重置所有状态
  const reset = useCallback(() => {
    cancelTask();
    clearImages();
    setPrompt("");
    setNumImages(1);
    setResults([]);
    setAiDescription("");
  }, [cancelTask, clearImages]);

  // 清理副作用
  const cleanup = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    uploadedImages.forEach((img) => {
      if (img.preview.startsWith("blob:")) {
        URL.revokeObjectURL(img.preview);
      }
    });
  }, [uploadedImages]);

  return {
    // 状态
    mode,
    uploadedImages,
    prompt,
    numImages,
    status,
    progress,
    results,
    taskId,
    aiDescription,

    // 方法
    setMode,
    setPrompt,
    setNumImages,
    addImages,
    removeImage,
    clearImages,
    submitTask,
    cancelTask,
    reset,
    cleanup,
  };
}
