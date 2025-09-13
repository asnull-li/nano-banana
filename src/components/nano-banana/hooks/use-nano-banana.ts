"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export type GenerationMode = "text-to-image" | "image-to-image";

export type TaskStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "fetching"
  | "completed"
  | "failed";

export interface UploadedImage {
  id: string;
  file: File | null; // 支持URL模式，file可为null
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
  const t = useTranslations("nano_banana");

  const [mode, setMode] = useState<GenerationMode>("text-to-image");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<TaskStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [aiDescription, setAiDescription] = useState<string>("");

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 上传单个图片到 R2
  const uploadImageToR2 = async (
    file: File,
    imageId: string
  ): Promise<string> => {
    try {
      // 更新上传进度 - 开始上传
      setUploadedImages((prev) =>
        prev.map((img) =>
          img.id === imageId ? { ...img, uploadProgress: 30 } : img
        )
      );

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
        prev.map((img) =>
          img.id === imageId
            ? { ...img, uploadProgress: 100, url: data.url }
            : img
        )
      );

      return data.url;
    } catch (error) {
      console.error("Upload error:", error);
      // 重置上传进度
      setUploadedImages((prev) =>
        prev.map((img) =>
          img.id === imageId ? { ...img, uploadProgress: 0 } : img
        )
      );
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
      } else if (image.file) {
        // 只有当 file 存在时才上传（跳过URL类型图片）
        try {
          const url = await uploadImageToR2(image.file, image.id);
          urls.push(url);
          uploadedCount++;

          // 更新总体进度
          const overallProgress =
            Math.round((uploadedCount / uploadedImages.length) * 15) + 5;
          setProgress(overallProgress);
        } catch (error) {
          throw new Error(
            t("messages.upload_image_failed", { filename: image.file.name })
          );
        }
      }
    }

    return urls;
  };

  // 添加图片到上传列表 - 不设置上传进度，避免闪烁
  const addImages = useCallback(
    (files: File[]) => {
      // 验证文件
      const validFiles = files.filter((file) => {
        // 检查文件类型
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        
        // 同时检查MIME类型和文件扩展名
        if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
          toast.error(`${file.name}: 不支持的文件格式，仅支持 JPG、PNG、WebP`);
          return false;
        }
        
        // 检查文件大小 (10MB = 10 * 1024 * 1024)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
          toast.error(`${file.name}: 文件大小为 ${sizeMB}MB，超过 10MB 限制`);
          return false;
        }
        
        return true;
      });

      if (validFiles.length === 0) {
        return;
      }

      const newImages: UploadedImage[] = validFiles.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        uploadProgress: 0, // 初始为0，不触发动画
      }));

      setUploadedImages((prev) => {
        const updated = [...prev, ...newImages];
        
        // 如果超过5张，需要清理被移除图片的 Blob URL
        if (updated.length > 5) {
          const toRemove = updated.slice(5);
          console.log("清理超出限制的图片 Blob URLs:", toRemove.map(img => img.preview));
          toRemove.forEach((img) => {
            if (img.preview.startsWith("blob:")) {
              URL.revokeObjectURL(img.preview);
            }
          });
          
          // 如果超过5张，提示用户
          toast.warning(t("messages.max_images_warning"));
        }
        
        // 限制最多5张图片
        return updated.slice(0, 5);
      });
    },
    [t]
  );

  // 移除图片
  const removeImage = useCallback((imageId: string) => {
    setUploadedImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === imageId);
      if (imageToRemove && imageToRemove.preview.startsWith("blob:")) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter((img) => img.id !== imageId);
    });
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

  // 从URL添加图片（用于再次编辑功能）
  const addImageFromUrl = useCallback(async (imageUrl: string) => {
    try {
      // 验证URL
      new URL(imageUrl);
      
      // 清空当前图片
      clearImages();
      
      // 创建虚拟的UploadedImage对象
      const newImage: UploadedImage = {
        id: `url-${Date.now()}-${Math.random()}`,
        file: null, // 标记为URL图片
        preview: imageUrl, // 直接使用URL作为预览
        uploadProgress: 100, // 已完成状态
        url: imageUrl, // 已有URL
      };

      // 添加新图片
      setUploadedImages([newImage]);
      
      // 切换到图生图模式
      setMode("image-to-image");
      
      toast.success("图片已应用到参考区域");
    } catch (error) {
      console.error("Invalid image URL:", error);
      toast.error("无效的图片链接");
    }
  }, [clearImages, setMode]);

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

        // 根据不同状态处理
        if (data.status === "pending" || data.status === "processing") {
          // 任务处理中，继续轮询
          // 模拟进度更新
          setProgress((prev) => Math.min(prev + 5, 90));
        } else if (data.status === "completed") {
          // 任务完成，停止轮询
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }

          // 直接从 status 响应中获取结果
          if (data.result?.images) {
            const results: GenerationResult[] = data.result.images.map(
              (img: any) => ({
                url: img.url,
                seed: img.seed,
                width: img.width,
                height: img.height,
              })
            );

            // 保存AI描述
            if (data.result.description) {
              setAiDescription(data.result.description);
            }

            setResults(results);
            setStatus("completed");
            setProgress(100);

            toast.success(
              t("messages.generation_success", { count: results.length })
            );
            onComplete?.(results);
          } else {
            // 没有结果数据
            setStatus("failed");
            const errorMsg = t("messages.get_results_failed");
            toast.error(errorMsg);
            onError?.(errorMsg);
          }
        } else if (data.status === "failed") {
          // 任务失败，停止轮询
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }

          setStatus("failed");
          const errorMsg = data.error || t("messages.task_failed");
          toast.error(errorMsg);
          onError?.(errorMsg);
        }
      } catch (error) {
        console.error("Status polling error:", error);
        // 继续轮询，不立即停止
      }
    }, 10000); // 每5秒轮询一次
  };

  // 提交生成任务
  const submitTask = async () => {
    try {
      // 验证输入
      if (!prompt.trim()) {
        toast.error(t("validation.please_enter_prompt"));
        return;
      }

      if (mode === "image-to-image" && uploadedImages.length === 0) {
        toast.error(t("validation.please_upload_image"));
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
          toast.info(
            t("messages.starting_upload", { count: uploadedImages.length })
          );
          imageUrls = await uploadAllImages();
          setProgress(20);
          toast.success(t("messages.upload_success"));
        } catch (error) {
          setStatus("failed");
          const errorMsg =
            error instanceof Error
              ? error.message
              : t("messages.upload_failed");
          toast.error(errorMsg);
          onError?.(errorMsg);
          return;
        }
      }

      // 提交任务
      setStatus("processing");
      const response = await fetch("/api/nano-banana/kie/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: mode,
          prompt: prompt.trim(),
          image_urls: mode === "image-to-image" ? imageUrls : undefined,
          num_images: 1, // 固定为1张
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || t("messages.submit_failed"));
      }

      // 保存任务ID
      setTaskId(data.task_id);
      setProgress(30);

      toast.info(t("messages.task_submitted"));

      // 开始轮询状态
      pollTaskStatus(data.task_id);
    } catch (error) {
      setStatus("failed");
      const errorMsg =
        error instanceof Error ? error.message : t("messages.submit_failed");

      // 特殊处理积分不足的情况
      if (errorMsg.includes("Insufficient credits")) {
        toast.error(t("messages.insufficient_credits"));
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
    status,
    progress,
    results,
    taskId,
    aiDescription,

    // 方法
    setMode,
    setPrompt,
    addImages,
    addImageFromUrl,
    removeImage,
    clearImages,
    submitTask,
    cancelTask,
    reset,
    cleanup,
  };
}
