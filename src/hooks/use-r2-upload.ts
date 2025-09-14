"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

interface UseR2UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

export function useR2Upload(options: UseR2UploadOptions = {}) {
  const { onProgress, onSuccess, onError } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({ loaded: 0, total: 0, percentage: 0 });
  const [error, setError] = useState<string | null>(null);

  // 获取预签名URL
  const getPresignedUrl = async (file: File) => {
    const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}&fileSize=${file.size}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get upload URL");
    }

    return await response.json();
  };

  // 上传文件到R2
  const uploadToR2 = async (presignedUrl: string, file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // 监听上传进度
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progressData = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          };
          setProgress(progressData);
          onProgress?.(progressData);
        }
      });

      // 上传完成
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      // 上传错误
      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed due to network error"));
      });

      // 上传中断
      xhr.addEventListener("abort", () => {
        reject(new Error("Upload was aborted"));
      });

      // 开始上传
      xhr.open("PUT", presignedUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    });
  };

  // 主上传函数
  const uploadFile = useCallback(async (file: File): Promise<UploadResult> => {
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    setIsUploading(true);
    setError(null);
    setProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      // 1. 获取预签名URL
      const { uploadUrl, publicUrl } = await getPresignedUrl(file);

      // 2. 上传到R2
      await uploadToR2(uploadUrl, file);

      // 3. 上传成功
      const result: UploadResult = { success: true, url: publicUrl };
      onSuccess?.(publicUrl);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";

      // 处理特殊错误情况
      if (errorMessage.includes("Request has expired") || errorMessage.includes("AccessDenied")) {
        // URL过期，尝试重新获取并重试一次
        try {
          const { uploadUrl, publicUrl } = await getPresignedUrl(file);
          await uploadToR2(uploadUrl, file);
          const result: UploadResult = { success: true, url: publicUrl };
          onSuccess?.(publicUrl);
          return result;
        } catch (retryError) {
          const finalError = retryError instanceof Error ? retryError.message : "Upload retry failed";
          setError(finalError);
          onError?.(finalError);
          return { success: false, error: finalError };
        }
      } else {
        setError(errorMessage);
        onError?.(errorMessage);
        return { success: false, error: errorMessage };
      }
    } finally {
      setIsUploading(false);
    }
  }, [onProgress, onSuccess, onError]);

  // 批量上传文件
  const uploadFiles = useCallback(async (files: File[]): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await uploadFile(file);
      results.push(result);

      // 如果上传失败，停止批量上传
      if (!result.success) {
        break;
      }
    }

    return results;
  }, [uploadFile]);

  // 验证文件
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // 检查文件类型
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: "Unsupported file type. Please use JPEG, PNG, or WEBP." };
    }

    // 检查文件大小 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: "File size exceeds 10MB limit." };
    }

    // 检查文件名
    if (!file.name || file.name.includes("..") || file.name.includes("/")) {
      return { valid: false, error: "Invalid file name." };
    }

    return { valid: true };
  }, []);

  // 上传文件（带验证）
  const uploadWithValidation = useCallback(async (file: File): Promise<UploadResult> => {
    const validation = validateFile(file);
    if (!validation.valid) {
      const error = validation.error || "File validation failed";
      toast.error(error);
      return { success: false, error };
    }

    return uploadFile(file);
  }, [validateFile, uploadFile]);

  // 重置状态
  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress({ loaded: 0, total: 0, percentage: 0 });
    setError(null);
  }, []);

  return {
    // 状态
    isUploading,
    progress,
    error,

    // 主要方法
    uploadFile,
    uploadFiles,
    uploadWithValidation,

    // 工具方法
    validateFile,
    reset,
  };
}