"use client";

import { useState } from "react";
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
}

export default function UpscalerWorkspace({
  className,
  pageData,
}: UpscalerWorkspaceProps) {
  const [task, setTask] = useState<UpscalerTask>({
    id: "",
    status: "idle",
    originalImage: null,
    upscaledImage: null,
    input: null,
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [scale, setScale] = useState(2);
  const [faceEnhance, setFaceEnhance] = useState(false);

  const { credits, refreshCredits } = useCredits();
  const { user, setShowSignModal } = useAppContext();
  const { submitUpscaleTask, getTaskStatus, uploadImage } = useUpscalerAPI();
  const router = useRouter();
  const canGenerate = uploadedFile && task.status === "idle";
  const isProcessing =
    task.status === "uploading" || task.status === "processing";

  const handleImageUpload = (file: File, preview: string) => {
    setUploadedFile(file);
    setTask((prev) => ({
      ...prev,
      originalImage: preview,
      upscaledImage: null,
      status: "idle",
      error: undefined,
    }));
  };

  const handleGenerate = async () => {
    if (!user) {
      setShowSignModal(true);
      return;
    }

    if (!uploadedFile) {
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
      // 1. 上传图片
      setTask((prev) => ({ ...prev, status: "uploading" }));
      toast.info(
        pageData?.workspace?.messages?.uploading || "Uploading image..."
      );

      const imageUrl = await uploadImage(uploadedFile);

      // 2. 提交放大任务
      setTask((prev) => ({ ...prev, status: "processing" }));
      toast.info(
        pageData?.workspace?.messages?.processing_start ||
          "Starting upscale process..."
      );

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
