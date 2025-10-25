"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Wand2, RefreshCw } from "lucide-react";
import { useCredits } from "@/hooks/use-credits";
import { useAppContext } from "@/contexts/app";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Wan25Task,
  Wan25TaskType,
  Wan25AspectRatio,
  Wan25Duration,
  Wan25Resolution,
} from "./types";
import {
  DEFAULT_DURATION,
  DEFAULT_RESOLUTION,
  DEFAULT_ASPECT_RATIO,
  calculateCredits,
  MIN_PROMPT_LENGTH,
  MAX_PROMPT_LENGTH,
} from "@/lib/constants/wan25";
import { useWan25API } from "./hooks/use-wan25-api";
import ModeSelector from "@/components/workspace/sora2/components/mode-selector";
import PromptInputZone from "@/components/workspace/sora2/components/prompt-input-zone";
import Wan25Controls from "./components/wan25-controls";
import AdvancedSettings from "./components/advanced-settings";
import VideoOutputDisplay from "@/components/workspace/sora2/components/video-output-display";
import ImageUploadZone from "@/components/workspace/upscaler/components/image-upload-zone";

interface Wan25WorkspaceProps {
  className?: string;
  pageData?: any;
  initialImageUrl?: string | null;
}

export default function Wan25Workspace({
  className,
  pageData,
  initialImageUrl,
}: Wan25WorkspaceProps) {
  // 获取多语言文本
  const t = pageData?.workspace || {};
  const { credits, refreshCredits } = useCredits();
  const { user, setShowSignModal } = useAppContext();
  const router = useRouter();
  const { uploadImage, submitVideoTask, getTaskStatus } = useWan25API();

  // State
  const [mode, setMode] = useState<Wan25TaskType>("image-to-video");
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState<Wan25Duration>(DEFAULT_DURATION);
  const [resolution, setResolution] =
    useState<Wan25Resolution>(DEFAULT_RESOLUTION);
  const [aspectRatio, setAspectRatio] =
    useState<Wan25AspectRatio>(DEFAULT_ASPECT_RATIO);
  const [negativePrompt, setNegativePrompt] = useState("");
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [inputImageFile, setInputImageFile] = useState<File | null>(null);
  const [inputImagePreview, setInputImagePreview] = useState<string | null>(
    initialImageUrl || null
  );
  const [isUrlMode, setIsUrlMode] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentTask, setCurrentTask] = useState<Wan25Task | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // 动态计算所需积分
  const creditsNeeded = useMemo(
    () => calculateCredits(duration, resolution),
    [duration, resolution]
  );

  // Polling
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Poll task status
  const pollTaskStatus = useCallback(
    async (taskId: string) => {
      try {
        const response = await getTaskStatus(taskId);

        // Convert API response to Wan25Task
        const task: Wan25Task = {
          id: response.task.task_id,
          status:
            response.task.status === "processing"
              ? "processing"
              : response.task.status,
          type: response.task.type,
          prompt: response.task.input.prompt,
          duration: response.task.input.duration,
          resolution: response.task.input.resolution,
          aspectRatio: response.task.input.aspect_ratio,
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
    [getTaskStatus, refreshCredits, t.toast]
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
  const handleModeChange = (newMode: Wan25TaskType) => {
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
        ?.replace("${min}", MIN_PROMPT_LENGTH.toString())
        .replace("${max}", MAX_PROMPT_LENGTH.toString());
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
        creditsNeeded.toString()
      );
      toast.warning(
        msg || `You need ${creditsNeeded} credits to generate videos`
      );
      router.push("/pricing");
      return;
    }

    setIsGenerating(true);

    // Create initial task
    const initialTask: Wan25Task = {
      id: "pending",
      status:
        mode === "image-to-video" && (inputImageFile || isUrlMode)
          ? isUrlMode
            ? "processing"
            : "uploading"
          : "processing",
      type: mode,
      prompt,
      duration,
      resolution,
      aspectRatio: mode === "text-to-video" ? aspectRatio : undefined,
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
        type: mode,
        prompt,
        duration,
        resolution,
        image_url: uploadedImageUrl,
        aspect_ratio: mode === "text-to-video" ? aspectRatio : undefined,
        negative_prompt: negativePrompt || undefined,
        seed: seed,
      });

      // Update task with real ID
      const newTask: Wan25Task = {
        id: taskId,
        status: "processing",
        type: mode,
        prompt,
        duration,
        resolution,
        aspectRatio: mode === "text-to-video" ? aspectRatio : undefined,
        negativePrompt,
        seed,
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
      link.download = `wan25-${currentTask.id}.mp4`;
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
    setPrompt("");
    setInputImageFile(null);
    setInputImagePreview(null);
    setIsUrlMode(false);
    setDuration(DEFAULT_DURATION);
    setResolution(DEFAULT_RESOLUTION);
    setAspectRatio(DEFAULT_ASPECT_RATIO);
    setNegativePrompt("");
    setSeed(undefined);
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

            {/* Controls */}
            <Wan25Controls
              mode={mode}
              duration={duration}
              onDurationChange={setDuration}
              resolution={resolution}
              onResolutionChange={setResolution}
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
              disabled={isGenerating}
              texts={t.controls}
            />

            {/* Advanced Settings */}
            <AdvancedSettings
              negativePrompt={negativePrompt}
              onNegativePromptChange={setNegativePrompt}
              seed={seed}
              onSeedChange={setSeed}
              disabled={isGenerating}
              texts={t.advanced_settings}
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
                    creditsNeeded.toString()
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
