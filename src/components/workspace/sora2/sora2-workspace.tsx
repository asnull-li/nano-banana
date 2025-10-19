"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Wand2, RefreshCw } from "lucide-react";
import { useCredits } from "@/hooks/use-credits";
import { useAppContext } from "@/contexts/app";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Sora2Task,
  Sora2TaskType,
  Sora2AspectRatio,
  Sora2Model,
  Sora2Duration,
  Sora2Quality,
} from "./types";
import {
  DEFAULT_MODEL,
  DEFAULT_ASPECT_RATIO,
  DEFAULT_DURATION,
  DEFAULT_QUALITY,
  DEFAULT_REMOVE_WATERMARK,
  calculateCredits,
  MIN_PROMPT_LENGTH,
  MAX_PROMPT_LENGTH,
} from "@/lib/constants/sora2";
import { useSora2API } from "./hooks/use-sora2-api";
import ModeSelector from "./components/mode-selector";
import ModelVersionSelector from "./components/model-version-selector";
import PromptInputZone from "./components/prompt-input-zone";
import Sora2Controls from "./components/sora2-controls";
import VideoOutputDisplay from "./components/video-output-display";
import ImageUploadZone from "@/components/workspace/upscaler/components/image-upload-zone";

interface Sora2WorkspaceProps {
  className?: string;
  pageData?: any;
  initialImageUrl?: string | null;
}

export default function Sora2Workspace({
  className,
  pageData,
  initialImageUrl,
}: Sora2WorkspaceProps) {
  // 获取多语言文本
  const t = pageData?.workspace || {};
  const { credits, refreshCredits } = useCredits();
  const { user, setShowSignModal } = useAppContext();
  const router = useRouter();
  const { uploadImage, submitVideoTask, getTaskStatus } = useSora2API();

  // State
  const [mode, setMode] = useState<Sora2TaskType>(
    initialImageUrl ? "image-to-video" : "text-to-video"
  );
  const [model, setModel] = useState<Sora2Model>(DEFAULT_MODEL);
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] =
    useState<Sora2AspectRatio>(DEFAULT_ASPECT_RATIO);
  const [duration, setDuration] = useState<Sora2Duration>(DEFAULT_DURATION);
  const [quality, setQuality] = useState<Sora2Quality>(DEFAULT_QUALITY);
  const [removeWatermark, setRemoveWatermark] = useState(
    DEFAULT_REMOVE_WATERMARK
  );
  const [inputImageFile, setInputImageFile] = useState<File | null>(null);
  const [inputImagePreview, setInputImagePreview] = useState<string | null>(
    initialImageUrl || null
  );
  const [isUrlMode, setIsUrlMode] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentTask, setCurrentTask] = useState<Sora2Task | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // 动态计算所需积分
  const creditsNeeded = useMemo(
    () => calculateCredits(model, duration, quality, removeWatermark),
    [model, duration, quality, removeWatermark]
  );

  // Polling
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Poll task status
  const pollTaskStatus = useCallback(
    async (taskId: string) => {
      try {
        const response = await getTaskStatus(taskId);

        // Convert API response to Sora2Task
        const task: Sora2Task = {
          id: response.task.task_id,
          status:
            response.task.status === "processing"
              ? "processing"
              : response.task.status,
          type: response.task.type,
          model: response.task.input.model || "sora2",
          prompt: response.task.input.prompt,
          aspectRatio: response.task.input.aspect_ratio,
          duration: response.task.input.n_frames,
          quality: response.task.input.size,
          removeWatermark: response.task.input.remove_watermark,
          inputImage: null,
          videoUrl: response.task.video_url || null,
          error: response.task.error_message,
        };

        setCurrentTask(task);

        // Stop polling if completed or failed
        if (task.status === "completed" || task.status === "failed") {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setIsGenerating(false);
          await refreshCredits();

          if (task.status === "completed") {
            toast.success(
              t.toast?.video_generated ||
                "Video Generated! Your video is ready to view."
            );
          } else {
            toast.error(
              task.error ||
                t.toast?.error_occurred ||
                "An error occurred during generation"
            );
          }
        }
      } catch (error) {
        console.error("Failed to poll task status:", error);
      }
    },
    [getTaskStatus, refreshCredits]
  );

  // Start polling
  const startPolling = useCallback(
    (taskId: string) => {
      // Clear existing interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      // Poll immediately
      pollTaskStatus(taskId);

      // Then poll every 10 seconds
      pollingIntervalRef.current = setInterval(() => {
        pollTaskStatus(taskId);
      }, 10000);
    },
    [pollTaskStatus]
  );

  // Handle mode change
  const handleModeChange = (newMode: Sora2TaskType) => {
    setMode(newMode);

    // Clear image when switching to text-to-video
    if (newMode === "text-to-video" && inputImagePreview) {
      if (inputImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(inputImagePreview);
      }
      setInputImageFile(null);
      setInputImagePreview(null);
      setIsUrlMode(false);
    }
  };

  // Handle image selection
  const handleImageSelect = useCallback(
    (file: File, preview: string) => {
      // Empty file means remove
      if (!file.name) {
        if (inputImagePreview && inputImagePreview.startsWith("blob:")) {
          URL.revokeObjectURL(inputImagePreview);
        }
        setInputImageFile(null);
        setInputImagePreview(null);
        setIsUrlMode(false);
        return;
      }

      // Clean up old blob URL
      if (inputImagePreview && inputImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(inputImagePreview);
      }

      // Save file and preview
      setInputImageFile(file);
      setInputImagePreview(preview);
      setIsUrlMode(false);
    },
    [inputImagePreview]
  );

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (inputImagePreview && inputImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(inputImagePreview);
      }
    };
  }, [inputImagePreview]);

  // Handle generate
  const handleGenerate = async () => {
    // Validation
    if (!prompt.trim()) {
      toast.error(
        t.toast?.prompt_required || "Please enter a prompt for video generation"
      );
      return;
    }

    if (
      prompt.length < MIN_PROMPT_LENGTH ||
      prompt.length > MAX_PROMPT_LENGTH
    ) {
      const msg = t.toast?.prompt_length_error
        ?.replace("${min}", MIN_PROMPT_LENGTH)
        .replace("${max}", MAX_PROMPT_LENGTH);
      toast.error(
        msg ||
          `Prompt must be between ${MIN_PROMPT_LENGTH} and ${MAX_PROMPT_LENGTH} characters`
      );
      return;
    }

    // Check image for image-to-video mode
    if (mode === "image-to-video" && !inputImageFile && !isUrlMode) {
      toast.error(
        t.toast?.image_required ||
          "Please upload an image for image-to-video generation"
      );
      return;
    }

    // Check login
    if (!user) {
      toast.warning(
        t.toast?.login_required || "Please login to generate videos"
      );
      setShowSignModal(true);
      return;
    }

    // Check credits
    if (credits.left_credits < creditsNeeded) {
      const msg = t.toast?.insufficient_credits?.replace(
        "${credits}",
        creditsNeeded
      );
      toast.warning(
        msg || `You need ${creditsNeeded} credits to generate videos`
      );
      router.push("/pricing");
      return;
    }

    setIsGenerating(true);

    // Create initial task
    const initialTask: Sora2Task = {
      id: "pending",
      status:
        mode === "image-to-video" && (inputImageFile || isUrlMode)
          ? isUrlMode
            ? "processing"
            : "uploading"
          : "processing",
      type: mode,
      model,
      prompt,
      aspectRatio,
      duration,
      quality,
      removeWatermark,
      inputImage: null,
      videoUrl: null,
      isUrlMode,
    };

    setCurrentTask(initialTask);

    try {
      let uploadedImageUrl: string | undefined = undefined;

      // Upload image first if in image-to-video mode
      if (mode === "image-to-video") {
        if (isUrlMode && inputImagePreview) {
          uploadedImageUrl = inputImagePreview;
          toast.info(t.toast?.uploading_image || "Using image from URL...");
        } else if (inputImageFile) {
          setIsUploading(true);
          toast.info(t.toast?.uploading_image || "Uploading image...");

          try {
            uploadedImageUrl = await uploadImage(inputImageFile);
            toast.success(
              t.toast?.image_uploaded || "Image uploaded successfully"
            );
          } catch (error) {
            throw new Error(
              error instanceof Error
                ? error.message
                : t.toast?.upload_failed || "Failed to upload image"
            );
          } finally {
            setIsUploading(false);
          }
        }
      }

      // Update task status to processing
      setCurrentTask({
        ...initialTask,
        status: "processing",
        inputImage: uploadedImageUrl || null,
      });

      // Submit task
      const taskId = await submitVideoTask({
        model,
        type: mode,
        prompt,
        image_urls: uploadedImageUrl ? [uploadedImageUrl] : undefined,
        aspect_ratio: aspectRatio,
        n_frames: duration,
        size: model === "sora2-pro" ? quality : undefined,
        remove_watermark: removeWatermark,
      });

      // Update task with real ID
      const newTask: Sora2Task = {
        id: taskId,
        status: "processing",
        type: mode,
        model,
        prompt,
        aspectRatio,
        duration,
        quality,
        removeWatermark,
        inputImage: uploadedImageUrl || null,
        videoUrl: null,
      };

      setCurrentTask(newTask);
      await refreshCredits();

      // Start polling
      startPolling(taskId);
    } catch (error) {
      setIsGenerating(false);
      setCurrentTask(null);
      toast.error(
        error instanceof Error ? error.message : "Failed to start generation"
      );
    }
  };

  // Handle download
  const handleDownload = async (videoUrl: string) => {
    if (!currentTask || !videoUrl || isDownloading) return;

    setIsDownloading(true);

    try {
      toast.info(t.toast?.downloading_video || "Downloading video...");

      const response = await fetch(videoUrl);
      if (!response.ok) throw new Error("Failed to fetch video");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `sora2-${currentTask.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

      toast.success(
        t.toast?.download_success || "Video downloaded successfully"
      );
    } catch (error) {
      console.error("Download error:", error);
      toast.error(
        t.toast?.download_failed ||
          "Failed to download video. Please try again."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    if (inputImagePreview && inputImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(inputImagePreview);
    }

    setCurrentTask(null);
    setMode("text-to-video");
    setModel(DEFAULT_MODEL);
    setPrompt("");
    setInputImageFile(null);
    setInputImagePreview(null);
    setIsUrlMode(false);
    setAspectRatio(DEFAULT_ASPECT_RATIO);
    setDuration(DEFAULT_DURATION);
    setQuality(DEFAULT_QUALITY);
    setRemoveWatermark(DEFAULT_REMOVE_WATERMARK);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const canGenerate =
    prompt.trim().length >= MIN_PROMPT_LENGTH && !isGenerating;

  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-4 px-0 lg:px-4">
        {/* Left Panel - Controls */}
        <div className="bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-zinc-700/50 rounded-xl shadow-xl">
          <div className="p-6 space-y-4">
            {/* Mode Selector */}
            <ModeSelector
              mode={mode}
              onModeChange={handleModeChange}
              disabled={isGenerating}
              texts={t.mode_selector}
            />

            {/* Image Upload */}
            {mode === "image-to-video" && (
              <ImageUploadZone
                onImageUpload={handleImageSelect}
                currentImage={inputImagePreview}
                disabled={isGenerating || isUploading}
                pageData={pageData}
              />
            )}

            {/* Prompt Input */}
            <PromptInputZone
              prompt={prompt}
              onPromptChange={setPrompt}
              disabled={isGenerating}
              maxLength={MAX_PROMPT_LENGTH}
              texts={t.prompt}
            />

            {/* Model Version Selector */}
            <ModelVersionSelector
              model={model}
              onModelChange={setModel}
              disabled={isGenerating}
              texts={t.model_selector}
            />

            {/* Controls */}
            <Sora2Controls
              model={model}
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
              duration={duration}
              onDurationChange={setDuration}
              quality={quality}
              onQualityChange={setQuality}
              removeWatermark={removeWatermark}
              onRemoveWatermarkChange={setRemoveWatermark}
              disabled={isGenerating}
              texts={t.controls}
            />

            {/* Credits Display */}
            <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-green-50 to-cyan-50 dark:from-green-950/20 dark:to-cyan-950/20 rounded-lg border border-green-200/50 dark:border-green-800/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t.controls?.credits_cost || "Credits Cost"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {creditsNeeded}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {t.controls?.credits_unit || "credits"}
                </span>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate || isUploading}
              className="text-black dark:text-white w-full h-11 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 font-semibold"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {t.generate_button?.uploading || "Uploading..."}
                </>
              ) : isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {t.generate_button?.generating || "Generating..."}
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  {t.generate_button?.generate?.replace(
                    "${credits}",
                    creditsNeeded
                  ) || `Generate Video (${creditsNeeded} credits)`}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Panel - Output */}
        <div className="bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-zinc-700/50 rounded-xl shadow-xl">
          <div className="p-6">
            <VideoOutputDisplay
              task={currentTask}
              onDownload={handleDownload}
              isDownloading={isDownloading}
              emptyStateTexts={t.empty_state}
              processingStateTexts={t.processing_state}
              failedStateTexts={t.failed_state}
              completedStateTexts={t.completed_state}
            />

            {/* Reset Button */}
            {currentTask?.status === "completed" && (
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t.toast?.new_video || "New Video"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
