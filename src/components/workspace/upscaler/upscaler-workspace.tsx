"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCredits } from "@/hooks/use-credits";
import { useAppContext } from "@/contexts/app";
import { Sparkles } from "lucide-react";
import ImageUploadZone from "./components/image-upload-zone";
import UpscalerControls from "./components/upscaler-controls";
import OutputDisplay from "./components/output-display";
import { useUpscalerAPI } from "./hooks/use-upscaler-api";
import { CREDITS_PER_UPSCALE } from "@/lib/constants/upscaler";
import { useRouter } from "@/i18n/navigation";

export interface UpscalerWorkspaceProps {
  className?: string;
  pageData?: any;
  initialImageUrl?: string | null;
}

export interface UpscalerTask {
  id: string;
  status: "idle" | "uploading" | "processing" | "completed" | "failed";
  originalImage: string | null;
  upscaledImage: string | null;
  input: {
    image: string;
    scale: number;
    face_enhance: boolean;
  } | null;
  error?: string;
  // 新增字段支持URL模式
  isUrlMode?: boolean;
  originalFileName?: string;
  originalContentType?: string;
}

export default function UpscalerWorkspace({
  className,
  pageData,
  initialImageUrl,
}: UpscalerWorkspaceProps) {
  const [task, setTask] = useState<UpscalerTask>({
    id: "",
    status: "idle",
    originalImage: null,
    upscaledImage: null,
    input: null,
    isUrlMode: false,
    originalFileName: undefined,
    originalContentType: undefined,
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [scale, setScale] = useState(2);
  const [faceEnhance, setFaceEnhance] = useState(false);

  const { credits, refreshCredits } = useCredits();
  const { user, setShowSignModal } = useAppContext();
  const { submitUpscaleTask, getTaskStatus, uploadImage } = useUpscalerAPI();
  const router = useRouter();
  const canGenerate = (uploadedFile || task.isUrlMode) && task.status === "idle";
  const isProcessing =
    task.status === "uploading" || task.status === "processing";

  const handleImageUpload = useCallback((file: File, preview: string) => {
    setUploadedFile(file);
    setTask((prev) => ({
      ...prev,
      originalImage: preview,
      upscaledImage: null,
      status: "idle",
      error: undefined,
      isUrlMode: false,
      originalFileName: file.name,
      originalContentType: file.type,
    }));
  }, []);

  // 处理从URL加载的图片（不下载，直接使用URL）
  const handleImageUploadFromUrl = useCallback((url: string, filename: string, contentType: string) => {
    // 清除File对象，因为我们使用URL模式
    setUploadedFile(null);
    setTask((prev) => ({
      ...prev,
      originalImage: url, // 直接使用原始URL作为预览
      upscaledImage: null,
      status: "idle",
      error: undefined,
      isUrlMode: true,
      originalFileName: filename,
      originalContentType: contentType,
    }));
  }, []);

  // 验证图片URL并直接使用（不下载）
  const loadImageFromUrl = useCallback(
    async (url: string) => {
      try {
        // 验证URL格式
        let validUrl: URL;
        try {
          validUrl = new URL(url);
        } catch {
          throw new Error("Invalid URL format");
        }

        // 检查是否为图片URL（基本检查）
        const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
        const hasImageExtension = validExtensions.some((ext) =>
          validUrl.pathname.toLowerCase().endsWith(ext)
        );

        if (
          !hasImageExtension &&
          !url.includes("blob:") &&
          !url.includes("data:")
        ) {
          // 如果没有明显的图片扩展名，我们仍然尝试验证，但给出提示
          console.warn(
            "URL might not be an image, but attempting to validate anyway"
          );
        }

        setTask((prev) => ({ ...prev, status: "uploading" }));

        // 使用HEAD请求验证图片信息（不下载内容）
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时（HEAD请求更快）

        let response: Response;
        let contentType = "";
        let contentLength: string | null = null;

        try {
          response = await fetch(url, {
            method: "HEAD",
            signal: controller.signal,
            mode: "cors",
            headers: {
              Accept: "image/*",
            },
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          contentType = response.headers.get("content-type") || "";
          contentLength = response.headers.get("content-length");
        } catch (headError) {
          clearTimeout(timeoutId);
          
          // HEAD请求失败时的降级策略：直接使用URL但发出警告
          console.warn("HEAD request failed, proceeding with URL validation bypass:", headError);
          
          // 基于URL扩展名进行基本验证
          if (!hasImageExtension && !url.includes("blob:") && !url.includes("data:")) {
            throw new Error("Unable to validate image format. Please ensure the URL points to a valid image file.");
          }
          
          // 跳过其他验证，直接使用URL
          contentType = "image/jpeg"; // 默认类型
          console.warn("Proceeding without server-side validation due to CORS or network restrictions.");
        }

        // 验证内容类型（如果获得了响应）
        if (contentType && !contentType.startsWith("image/")) {
          throw new Error(
            `Invalid content type: ${contentType}. Expected an image.`
          );
        }

        // 检查文件大小（从Content-Length头部，如果可用）
        if (contentLength) {
          const fileSize = parseInt(contentLength, 10);
          const maxSize = 10 * 1024 * 1024; // 10MB
          if (fileSize > maxSize) {
            throw new Error("Image is too large. Maximum size is 10MB.");
          }
        }

        // 直接使用原始URL进行预览和处理
        handleImageUploadFromUrl(url, validUrl.pathname.split("/").pop() || "image.jpg", contentType);

        // toast.success(pageData?.workspace?.messages?.image_loaded || "Image loaded successfully");
      } catch (error) {
        console.error("Failed to validate image from URL:", error);

        let errorMessage =
          pageData?.workspace?.messages?.image_load_failed ||
          "Failed to load image from URL";

        // 提供更具体的错误消息
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            errorMessage = "Request timed out. Please try again.";
          } else if (error.message.includes("CORS")) {
            errorMessage =
              "Unable to access image due to CORS policy. Please try uploading the image directly.";
          } else if (error.message.includes("Invalid URL")) {
            errorMessage = "Invalid image URL format.";
          } else if (error.message.includes("Invalid content type")) {
            errorMessage = "The URL doesn't point to a valid image file.";
          } else if (error.message.includes("too large")) {
            errorMessage =
              "Image is too large. Please use an image smaller than 10MB.";
          }
        }

        toast.error(errorMessage);
        setTask((prev) => ({ ...prev, status: "idle" }));
      }
    },
    [
      handleImageUploadFromUrl,
      pageData?.workspace?.messages?.image_loaded,
      pageData?.workspace?.messages?.image_load_failed,
    ]
  );

  // 处理初始图片URL
  useEffect(() => {
    if (initialImageUrl && initialImageUrl.trim()) {
      loadImageFromUrl(initialImageUrl);
    }
  }, [initialImageUrl, loadImageFromUrl]);

  const handleGenerate = async () => {
    if (!user) {
      setShowSignModal(true);
      return;
    }

    if (!uploadedFile && !task.isUrlMode) {
      toast.error(
        pageData?.workspace?.messages?.upload_required ||
          "Please upload an image first"
      );
      return;
    }

    // 验证积分 (使用固定数值检查)
    if (credits.left_credits < CREDITS_PER_UPSCALE) {
      const insufficientCreditsMsg = pageData?.workspace?.messages
        ?.insufficient_credits
        ? pageData.workspace.messages.insufficient_credits.replace(
            "${credits}",
            CREDITS_PER_UPSCALE.toString()
          )
        : `Insufficient credits. Need ${CREDITS_PER_UPSCALE} credits for upscaling.`;
      toast.error(insufficientCreditsMsg);
      router.push("/pricing");
      return;
    }

    try {
      let imageUrl: string;

      if (task.isUrlMode) {
        // URL模式：直接使用原始URL，跳过上传步骤
        imageUrl = task.originalImage!;
        setTask((prev) => ({ ...prev, status: "processing" }));
        toast.info(
          pageData?.workspace?.messages?.processing_start ||
            "Starting upscale process..."
        );
      } else {
        // File模式：需要先上传文件
        setTask((prev) => ({ ...prev, status: "uploading" }));
        toast.info(
          pageData?.workspace?.messages?.uploading || "Uploading image..."
        );

        imageUrl = await uploadImage(uploadedFile!);

        // 上传完成后开始处理
        setTask((prev) => ({ ...prev, status: "processing" }));
        toast.info(
          pageData?.workspace?.messages?.processing_start ||
            "Starting upscale process..."
        );
      }

      // 提交放大任务
      const taskId = await submitUpscaleTask({
        input: {
          image: imageUrl,
          scale,
          face_enhance: faceEnhance,
        },
      });

      setTask((prev) => ({
        ...prev,
        id: taskId,
        input: {
          image: imageUrl,
          scale,
          face_enhance: faceEnhance,
        },
      }));

      // 3. 轮询状态
      const checkStatus = async () => {
        try {
          const result = await getTaskStatus(taskId);

          if (result.status === "completed") {
            setTask((prev) => ({
              ...prev,
              status: "completed",
              upscaledImage: result.result?.images?.[0]?.url || null,
            }));
            toast.success(
              pageData?.workspace?.messages?.success ||
                "Image upscaled successfully!"
            );
            refreshCredits();
            return;
          }

          if (result.status === "failed") {
            setTask((prev) => ({
              ...prev,
              status: "failed",
              error: result.error || "Upscale failed",
            }));
            toast.error(
              result.error ||
                pageData?.workspace?.messages?.failed ||
                "Upscale failed"
            );
            return;
          }

          // 继续轮询
          setTimeout(checkStatus, 10000);
        } catch (error) {
          console.error("Status check error:", error);
          setTimeout(checkStatus, 15000); // 延长轮询间隔
        }
      };

      // 开始轮询
      setTimeout(checkStatus, 2000);
    } catch (error) {
      setTask((prev) => ({
        ...prev,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      }));
      toast.error(
        error instanceof Error
          ? error.message
          : pageData?.workspace?.messages?.error || "Failed to upscale image"
      );
    }
  };

  const handleReset = () => {
    setTask({
      id: "",
      status: "idle",
      originalImage: null,
      upscaledImage: null,
      input: null,
      isUrlMode: false,
      originalFileName: undefined,
      originalContentType: undefined,
    });
    setUploadedFile(null);
    setScale(2);
    setFaceEnhance(false);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Status Indicator - 仅在处理时显示 */}
      {/* {(task.status === "uploading" || task.status === "processing") && (
        <StatusIndicator
          status={task.status}
          error={task.error}
          className="mb-6"
        />
      )} */}

      {/* 科幻仪表盘布局 */}
      <div className="grid lg:grid-cols-[350px_1fr] gap-8 min-h-[600px]">
        {/* Left Panel - Controls */}
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-800 dark:to-zinc-900 border border-green-200/30 dark:border-green-800/30 shadow-lg backdrop-blur-sm rounded-xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                {pageData?.workspace?.controls?.title || "CONTROLS"}
              </h3>
            </div>

            {/* Upload Zone */}
            <div className="mb-6">
              <ImageUploadZone
                onImageUpload={handleImageUpload}
                disabled={isProcessing}
                currentImage={task.originalImage}
                pageData={pageData}
              />
            </div>

            {/* Controls */}
            <div className="mb-6">
              <UpscalerControls
                scale={scale}
                onScaleChange={setScale}
                faceEnhance={faceEnhance}
                onFaceEnhanceChange={setFaceEnhance}
                disabled={isProcessing}
                pageData={pageData}
              />
            </div>

            {/* Action Button */}
            <div className="space-y-3 mt-2">
              {/* Credits Cost Display */}
              <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-green-50 to-cyan-50 dark:from-green-950/20 dark:to-cyan-950/20 rounded-lg border border-green-200/50 dark:border-green-800/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {pageData?.workspace?.controls?.credits_cost ||
                      "Credits Cost"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {CREDITS_PER_UPSCALE}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {pageData?.workspace?.controls?.credits_unit || "credits"}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="w-full h-12 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white shadow-lg shadow-green-500/25 text-lg font-semibold"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                    {task.status === "uploading"
                      ? pageData?.workspace?.status?.uploading || "Uploading..."
                      : pageData?.workspace?.status?.processing ||
                        "Processing..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-3" />{" "}
                    {pageData?.workspace?.controls?.execute_button || "EXECUTE"}
                  </>
                )}
              </Button>

              {(task.status === "completed" || task.status === "failed") && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950/30"
                >
                  🔄{" "}
                  {pageData?.workspace?.controls?.restart_button || "Restart"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="space-y-4">
          <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-800 dark:to-zinc-900 border border-green-200/30 dark:border-green-800/30 shadow-lg backdrop-blur-sm h-full rounded-xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                {pageData?.workspace?.results?.title || "PREVIEW"}
              </h3>
            </div>

            <OutputDisplay
              originalImage={task.originalImage}
              upscaledImage={task.upscaledImage}
              isProcessing={isProcessing}
              status={task.status}
              scale={scale}
              faceEnhance={faceEnhance}
              onReset={handleReset}
              pageData={pageData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
