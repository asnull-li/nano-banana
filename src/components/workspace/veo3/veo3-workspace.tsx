"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Wand2, RefreshCw, Info } from "lucide-react";
import { useCredits } from "@/hooks/use-credits";
import { useAppContext } from "@/contexts/app";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Veo3Model,
  AspectRatio,
  Veo3Task,
  Veo3TaskType,
  ModeOption,
  GenerationType,
} from "./types";
import {
  DEFAULT_VEO3_MODEL,
  DEFAULT_ASPECT_RATIO,
  getCreditsForModel,
  CREDITS_PER_1080P,
} from "@/lib/constants/veo3";
import { useVeo3API } from "./hooks/use-veo3-api";
import ModeSelector from "./components/mode-selector";
import PromptInputZone from "./components/prompt-input-zone";
import Veo3Controls from "./components/veo3-controls";
import VideoOutputDisplay from "./components/video-output-display";
import Upgrade1080pModal from "./components/upgrade-1080p-modal";
import ImageUploadZone from "@/components/workspace/upscaler/components/image-upload-zone";
import MultiImageUploadZone from "./components/multi-image-upload-zone";

// 导入样式
import "./veo3-styles.css";

interface Veo3WorkspaceProps {
  className?: string;
  pageData?: any;
  initialImageUrl?: string | null;
}

export default function Veo3Workspace({
  className,
  pageData,
  initialImageUrl,
}: Veo3WorkspaceProps) {
  // 获取多语言文本
  const t = pageData?.workspace || {};
  const { credits, refreshCredits } = useCredits();
  const { user, setShowSignModal } = useAppContext();
  const router = useRouter();
  const { uploadImage, submitVideoTask, getTaskStatus, upgrade1080p } =
    useVeo3API();

  // State
  const [mode, setMode] = useState<ModeOption>("image-to-video");
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<Veo3Model>(DEFAULT_VEO3_MODEL);
  const [aspectRatio, setAspectRatio] =
    useState<AspectRatio>(DEFAULT_ASPECT_RATIO);
  const [watermark, setWatermark] = useState<string>("");
  const [seeds, setSeeds] = useState<number | undefined>(undefined);
  const [enableTranslation, setEnableTranslation] = useState<boolean>(true);
  const [inputImageFile, setInputImageFile] = useState<File | null>(null);
  const [inputImagePreview, setInputImagePreview] = useState<string | null>(
    initialImageUrl || null
  );
  const [isUrlMode, setIsUrlMode] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentTask, setCurrentTask] = useState<Veo3Task | null>(null);
  const [show1080pModal, setShow1080pModal] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [downloadingQuality, setDownloadingQuality] = useState<
    "720p" | "1080p" | null
  >(null);

  // Keyframe mode states
  const [keyframeMode, setKeyframeMode] = useState(false);
  const [endImageFile, setEndImageFile] = useState<File | null>(null);
  const [endImagePreview, setEndImagePreview] = useState<string | null>(null);
  const [isEndImageUrlMode, setIsEndImageUrlMode] = useState<boolean>(false);

  // Reference to video mode states (multiple images)
  const [referenceImageFiles, setReferenceImageFiles] = useState<File[]>([]);
  const [referenceImagePreviews, setReferenceImagePreviews] = useState<
    string[]
  >([]);

  // Polling
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Poll task status
  const pollTaskStatus = useCallback(
    async (taskId: string) => {
      try {
        const response = await getTaskStatus(taskId);

        // Convert TaskStatusResponse to Veo3Task
        const task: Veo3Task = {
          id: response.task.task_id,
          status:
            response.task.status === "pending"
              ? "processing"
              : response.task.status,
          type: response.task.type,
          prompt: response.task.input.prompt,
          model: response.task.model,
          aspectRatio: response.task.input.aspect_ratio,
          inputImage: null,
          video720pUrl: response.task.video_720p_url || null,
          video1080pUrl: response.task.video_1080p_url || null,
          has1080p: response.task.has_1080p,
          canUpgradeTo1080p: response.task.can_upgrade_to_1080p,
          watermark: response.task.input.watermark,
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

      // Then poll every 3 seconds
      pollingIntervalRef.current = setInterval(() => {
        pollTaskStatus(taskId);
      }, 10000);
    },
    [pollTaskStatus]
  );

  // Handle mode change
  const handleModeChange = (newMode: ModeOption) => {
    setMode(newMode);

    // Clear images when switching to text-to-video
    if (newMode === "text-to-video") {
      // Clear start frame
      if (inputImagePreview && inputImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(inputImagePreview);
      }
      setInputImageFile(null);
      setInputImagePreview(null);
      setIsUrlMode(false);

      // Clear end frame and keyframe mode
      if (endImagePreview && endImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(endImagePreview);
      }
      setEndImageFile(null);
      setEndImagePreview(null);
      setIsEndImageUrlMode(false);
      setKeyframeMode(false);

      // Clear reference images
      referenceImagePreviews.forEach((preview) => {
        if (preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
      setReferenceImageFiles([]);
      setReferenceImagePreviews([]);
    }

    // Clear reference images when switching to image-to-video
    if (newMode === "image-to-video") {
      referenceImagePreviews.forEach((preview) => {
        if (preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
      setReferenceImageFiles([]);
      setReferenceImagePreviews([]);
    }

    // Clear single/keyframe images when switching to reference-to-video
    if (newMode === "reference-to-video") {
      if (inputImagePreview && inputImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(inputImagePreview);
      }
      setInputImageFile(null);
      setInputImagePreview(null);
      setIsUrlMode(false);

      if (endImagePreview && endImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(endImagePreview);
      }
      setEndImageFile(null);
      setEndImagePreview(null);
      setIsEndImageUrlMode(false);
      setKeyframeMode(false);

      // Force model and aspect ratio for reference mode
      setModel("veo3_fast");
      setAspectRatio("16:9");
    }

    // Change aspect ratio if Auto is selected but switching to text-to-video
    if (newMode === "text-to-video" && aspectRatio === "Auto") {
      setAspectRatio("16:9");
    }
  };

  // Handle image selection (not upload yet)
  const handleImageSelect = useCallback(
    (file: File, preview: string) => {
      // Empty file means remove (from ImageUploadZone clear action)
      if (!file.name) {
        // 清理旧的 blob URL
        if (inputImagePreview && inputImagePreview.startsWith("blob:")) {
          URL.revokeObjectURL(inputImagePreview);
        }
        setInputImageFile(null);
        setInputImagePreview(null);
        setIsUrlMode(false);
        return;
      }

      // 清理旧的 blob URL
      if (inputImagePreview && inputImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(inputImagePreview);
      }

      // 保存文件和预览，不立即上传
      setInputImageFile(file);
      setInputImagePreview(preview);
      setIsUrlMode(false); // 切换到文件模式
    },
    [inputImagePreview]
  );

  // Handle image upload from URL (without downloading, directly use URL)
  const handleImageUploadFromUrl = useCallback(
    (url: string, _filename: string) => {
      // 清除File对象，因为我们使用URL模式
      setInputImageFile(null);
      setInputImagePreview(url); // 直接使用原始URL作为预览
      setIsUrlMode(true); // 标记为URL模式
    },
    []
  );

  // Handle end image selection (for keyframe mode)
  const handleEndImageSelect = useCallback(
    (file: File, preview: string) => {
      // Empty file means remove
      if (!file.name) {
        if (endImagePreview && endImagePreview.startsWith("blob:")) {
          URL.revokeObjectURL(endImagePreview);
        }
        setEndImageFile(null);
        setEndImagePreview(null);
        setIsEndImageUrlMode(false);
        return;
      }

      // 清理旧的 blob URL
      if (endImagePreview && endImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(endImagePreview);
      }

      // 保存文件和预览
      setEndImageFile(file);
      setEndImagePreview(preview);
      setIsEndImageUrlMode(false);
    },
    [endImagePreview]
  );

  // Handle end image upload from URL (for keyframe mode)
  const handleEndImageUploadFromUrl = useCallback(
    (url: string, _filename: string) => {
      setEndImageFile(null);
      setEndImagePreview(url);
      setIsEndImageUrlMode(true);
    },
    []
  );

  // Handle reference images change (for reference-to-video mode)
  const handleReferenceImagesChange = useCallback(
    (files: File[], previews: string[]) => {
      // Clean up old previews
      referenceImagePreviews.forEach((preview) => {
        if (preview.startsWith("blob:") && !previews.includes(preview)) {
          URL.revokeObjectURL(preview);
        }
      });

      setReferenceImageFiles(files);
      setReferenceImagePreviews(previews);
    },
    [referenceImagePreviews]
  );

  // Validate image URL and use it directly (without downloading)
  const loadImageFromUrl = useCallback(
    async (url: string) => {
      try {
        // Validate URL format
        let validUrl: URL;
        try {
          validUrl = new URL(url);
        } catch {
          throw new Error("Invalid URL format");
        }

        // Check if it's an image URL (basic check)
        const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
        const hasImageExtension = validExtensions.some((ext) =>
          validUrl.pathname.toLowerCase().endsWith(ext)
        );

        if (
          !hasImageExtension &&
          !url.includes("blob:") &&
          !url.includes("data:")
        ) {
          // If no obvious image extension, we still try to validate but give a warning
          console.warn(
            "URL might not be an image, but attempting to validate anyway"
          );
        }

        // Use HEAD request to validate image info (without downloading content)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        let contentType = "";

        try {
          const response = await fetch(url, {
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
        } catch (headError) {
          clearTimeout(timeoutId);

          // Fallback strategy when HEAD request fails: use URL directly but with warning
          console.warn(
            "HEAD request failed, proceeding with URL validation bypass:",
            headError
          );

          // Basic validation based on URL extension
          if (
            !hasImageExtension &&
            !url.includes("blob:") &&
            !url.includes("data:")
          ) {
            throw new Error(
              "Unable to validate image format. Please ensure the URL points to a valid image file."
            );
          }

          // Skip other validation, use URL directly
          contentType = "image/jpeg"; // default type
          console.warn(
            "Proceeding without server-side validation due to CORS or network restrictions."
          );
        }

        // Validate content type (if response was received)
        if (contentType && !contentType.startsWith("image/")) {
          throw new Error(
            `Invalid content type: ${contentType}. Expected an image.`
          );
        }

        // Use original URL directly for preview and processing
        handleImageUploadFromUrl(
          url,
          validUrl.pathname.split("/").pop() || "image.jpg"
        );

        toast.success(
          t.toast?.image_loaded || "Image loaded successfully from URL"
        );
      } catch (error) {
        console.error("Failed to validate image from URL:", error);

        let errorMessage =
          t.toast?.image_load_failed || "Failed to load image from URL";

        // Provide more specific error message
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
          }
        }

        toast.error(errorMessage);
      }
    },
    [handleImageUploadFromUrl, t.toast]
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

  // Cleanup end image blob URL on unmount
  useEffect(() => {
    return () => {
      if (endImagePreview && endImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(endImagePreview);
      }
    };
  }, [endImagePreview]);

  // Cleanup reference images blob URLs on unmount
  useEffect(() => {
    return () => {
      referenceImagePreviews.forEach((preview) => {
        if (preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [referenceImagePreviews]);

  // Handle initial image URL from query params
  useEffect(() => {
    if (initialImageUrl && initialImageUrl.trim()) {
      loadImageFromUrl(initialImageUrl);
    }
  }, [initialImageUrl, loadImageFromUrl]);

  // Handle keyframe mode toggle - clear end frame when disabled
  useEffect(() => {
    if (!keyframeMode && endImagePreview) {
      // Clear end frame when keyframe mode is disabled
      if (endImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(endImagePreview);
      }
      setEndImageFile(null);
      setEndImagePreview(null);
      setIsEndImageUrlMode(false);
    }
  }, [keyframeMode]);

  // Handle generate
  const handleGenerate = async () => {
    // Validation
    if (!prompt.trim()) {
      toast.error(
        t.toast?.prompt_required || "Please enter a prompt for video generation"
      );
      return;
    }

    if (prompt.length < 3 || prompt.length > 5000) {
      toast.error(
        t.toast?.prompt_length_error ||
          "Prompt must be between 3 and 5000 characters"
      );
      return;
    }

    // Check image for image-to-video mode
    if (mode === "image-to-video") {
      if (keyframeMode) {
        // Keyframe mode: need both start and end images
        if (!inputImageFile && !isUrlMode) {
          toast.error(
            t.keyframe_mode?.start_frame_required || "请上传首帧图片"
          );
          return;
        }
        if (!endImageFile && !isEndImageUrlMode) {
          toast.error(t.keyframe_mode?.end_frame_required || "请上传尾帧图片");
          return;
        }
      } else {
        // Single image mode: need one image
        if (!inputImageFile && !isUrlMode) {
          toast.error(
            t.toast?.image_required ||
              "Please upload an image for image-to-video generation"
          );
          return;
        }
      }
    }

    // Check images for reference-to-video mode
    if (mode === "reference-to-video") {
      if (referenceImageFiles.length === 0) {
        toast.error(
          t.toast?.reference_images_required ||
            "Please upload 1-3 reference images for reference-to-video generation"
        );
        return;
      }
      if (referenceImageFiles.length > 3) {
        toast.error(
          t.toast?.too_many_images || "Maximum 3 reference images allowed"
        );
        return;
      }
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
    const requiredCredits = getCreditsForModel(model);
    if (credits.left_credits < requiredCredits) {
      const mode_text = model === "veo3" ? "Quality" : "Fast";
      const msg = t.toast?.insufficient_credits
        ?.replace("${credits}", requiredCredits)
        .replace("${mode}", mode_text);
      toast.warning(
        msg ||
          `You need ${requiredCredits} credits to generate with ${mode_text} mode`
      );
      router.push("/pricing");
      return;
    }

    setIsGenerating(true);

    // Convert ModeOption to Veo3TaskType for API
    const apiTaskType: Veo3TaskType =
      mode === "text-to-video" ? "text-to-video" : "image-to-video";
    const generationType: GenerationType | undefined =
      mode === "image-to-video"
        ? "FIRST_AND_LAST_FRAMES_2_VIDEO"
        : mode === "reference-to-video"
        ? "REFERENCE_2_VIDEO"
        : undefined;

    // Create initial task immediately to show processing state
    const initialTask: Veo3Task = {
      id: "pending",
      status:
        (mode === "image-to-video" && (inputImageFile || isUrlMode)) ||
        (mode === "reference-to-video" && referenceImageFiles.length > 0)
          ? "uploading"
          : "processing",
      type: apiTaskType,
      prompt,
      model,
      aspectRatio,
      inputImage: null,
      video720pUrl: null,
      video1080pUrl: null,
      has1080p: false,
      canUpgradeTo1080p: aspectRatio === "16:9",
      watermark,
      seeds,
      isUrlMode, // 保留URL模式状态
    };

    setCurrentTask(initialTask);

    try {
      let uploadedImageUrls: string[] = [];

      // Upload image(s) first if in image-to-video or reference-to-video mode
      if (mode === "image-to-video") {
        if (keyframeMode) {
          // Keyframe mode: upload start and end frames
          setIsUploading(true);
          toast.info(
            t.toast?.uploading_images || "Uploading start and end frames..."
          );

          try {
            // Upload start frame
            const startUrl = isUrlMode
              ? inputImagePreview!
              : await uploadImage(inputImageFile!);

            // Upload end frame
            const endUrl = isEndImageUrlMode
              ? endImagePreview!
              : await uploadImage(endImageFile!);

            uploadedImageUrls = [startUrl, endUrl];

            toast.success(
              t.toast?.images_uploaded ||
                "Start and end frames uploaded successfully"
            );
          } catch (error) {
            throw new Error(
              error instanceof Error
                ? error.message
                : t.toast?.upload_failed || "Failed to upload images"
            );
          } finally {
            setIsUploading(false);
          }
        } else {
          // Single image mode
          if (isUrlMode && inputImagePreview) {
            // URL模式：直接使用原始URL，跳过上传步骤
            uploadedImageUrls = [inputImagePreview];
            toast.info(t.toast?.processing_start || "Using image from URL...");
          } else if (inputImageFile) {
            // File模式：需要先上传文件
            setIsUploading(true);
            toast.info(t.toast?.uploading_image || "Uploading image...");

            try {
              const url = await uploadImage(inputImageFile);
              uploadedImageUrls = [url];
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
      } else if (mode === "reference-to-video") {
        // Reference mode: upload all reference images
        setIsUploading(true);
        toast.info(
          t.toast?.uploading_reference_images ||
            `Uploading ${referenceImageFiles.length} reference image(s)...`
        );

        try {
          const uploadPromises = referenceImageFiles.map((file) =>
            uploadImage(file)
          );
          uploadedImageUrls = await Promise.all(uploadPromises);

          toast.success(
            t.toast?.reference_images_uploaded ||
              `${uploadedImageUrls.length} reference image(s) uploaded successfully`
          );
        } catch (error) {
          throw new Error(
            error instanceof Error
              ? error.message
              : t.toast?.upload_failed || "Failed to upload reference images"
          );
        } finally {
          setIsUploading(false);
        }
      }

      // Update task status to processing after upload
      setCurrentTask({
        ...initialTask,
        status: "processing",
        inputImage: uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : null,
      });

      // Submit task - returns task_id as string
      const taskId = await submitVideoTask({
        type: apiTaskType,
        prompt,
        model,
        image_urls:
          uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
        aspect_ratio: aspectRatio,
        watermark: watermark || undefined,
        seeds,
        enable_translation: enableTranslation,
        generation_type: generationType,
      });

      // Update task with real task ID
      const newTask: Veo3Task = {
        id: taskId,
        status: "processing",
        type: apiTaskType,
        prompt,
        model,
        aspectRatio,
        inputImage: uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : null,
        video720pUrl: null,
        video1080pUrl: null,
        has1080p: false,
        canUpgradeTo1080p: aspectRatio === "16:9",
        watermark,
        seeds,
      };

      setCurrentTask(newTask);
      await refreshCredits();

      // Start polling
      startPolling(taskId);

      // toast.success(`Generation started (${requiredCredits} credits used)`);
    } catch (error) {
      setIsGenerating(false);
      setCurrentTask(null); // Clear task on error
      toast.error(
        error instanceof Error ? error.message : "Failed to start generation"
      );
    }
  };

  // Handle 1080p upgrade with auto-retry
  const handle1080pUpgrade = async () => {
    if (!currentTask || !currentTask.canUpgradeTo1080p) return;

    if (credits.left_credits < CREDITS_PER_1080P) {
      const msg = t.toast?.need_credits_1080p?.replace(
        "${credits}",
        CREDITS_PER_1080P
      );
      toast.error(
        msg || `You need ${CREDITS_PER_1080P} credits for 1080P upgrade`
      );
      return;
    }

    setShow1080pModal(false);
    setIsUpgrading(true);

    const maxRetries = 12; // 最多重试12次 (约4分钟)
    const retryInterval = 20000; // 每10秒重试一次
    let retryCount = 0;

    const attemptUpgrade = async (): Promise<void> => {
      try {
        // upgrade1080p returns video_1080p_url as string
        const video1080pUrl = await upgrade1080p(currentTask.id);

        setCurrentTask({
          ...currentTask,
          has1080p: true,
          video1080pUrl,
        });

        await refreshCredits();

        toast.success(
          t.toast?.upgraded_1080p ||
            "Upgraded to 1080P! Your high-quality video is ready"
        );
      } catch (error) {
        // 检查是否是处理中错误
        if ((error as any).code === "PROCESSING") {
          retryCount++;

          if (retryCount >= maxRetries) {
            toast.error(
              t.toast?.upgrade_timeout ||
                "1080P upgrade timeout. The server is still processing, please try again later."
            );
            setIsUpgrading(false);
            return;
          }

          // 第一次显示详细提示
          if (retryCount === 1) {
            toast.info(
              t.toast?.preparing_1080p ||
                "1080P video is being prepared by the server. This will take 1-2 minutes, please wait...",
              {
                duration: 5000,
              }
            );
          } else if (retryCount % 3 === 0) {
            // 每3次重试显示一次进度
            const msg = t.toast?.still_processing?.replace(
              "${seconds}",
              retryCount * 10
            );
            toast.info(
              msg || `Still processing... (${retryCount * 10}s elapsed)`,
              {
                duration: 3000,
              }
            );
          }

          // 等待后重试
          await new Promise((resolve) => setTimeout(resolve, retryInterval));
          return attemptUpgrade();
        } else {
          toast.error(
            error instanceof Error
              ? error.message
              : t.toast?.upgrade_failed || "Failed to upgrade video"
          );
          setIsUpgrading(false);
        }
      }
    };

    try {
      await attemptUpgrade();
    } finally {
      setIsUpgrading(false);
    }
  };

  // Handle download
  const handleDownload = async (
    videoUrl: string,
    quality: "720p" | "1080p"
  ) => {
    if (!currentTask || !videoUrl || downloadingQuality) return;

    setDownloadingQuality(quality);

    try {
      const msg = t.toast?.downloading_video?.replace("${quality}", quality);
      toast.info(msg || `Downloading ${quality} video...`);

      // Fetch the video as blob
      const response = await fetch(videoUrl);
      if (!response.ok) throw new Error("Failed to fetch video");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `veo3-${currentTask.id}-${quality}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up blob URL
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

      const successMsg = t.toast?.download_success?.replace(
        "${quality}",
        quality
      );
      toast.success(successMsg || `${quality} video downloaded successfully`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error(
        t.toast?.download_failed ||
          "Failed to download video. Please try again."
      );
    } finally {
      setDownloadingQuality(null);
    }
  };

  // Handle reset
  const handleReset = () => {
    // 清理首帧 blob URL
    if (inputImagePreview && inputImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(inputImagePreview);
    }
    // 清理尾帧 blob URL
    if (endImagePreview && endImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(endImagePreview);
    }
    // 清理参考图 blob URLs
    referenceImagePreviews.forEach((preview) => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    });

    setCurrentTask(null);
    setMode("image-to-video");
    setPrompt("");
    setInputImageFile(null);
    setInputImagePreview(null);
    setIsUrlMode(false);
    setKeyframeMode(false);
    setEndImageFile(null);
    setEndImagePreview(null);
    setIsEndImageUrlMode(false);
    setReferenceImageFiles([]);
    setReferenceImagePreviews([]);
    setWatermark("");
    setSeeds(undefined);
    setEnableTranslation(true);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const canGenerate = prompt.trim().length >= 3 && !isGenerating;
  const requiredCredits = getCreditsForModel(model);

  return (
    <div className={`w-full ${className}`}>
      {/* 响应式网格布局 */}
      <div className="veo3-workspace grid grid-cols-1 lg:grid-cols-[500px_1fr] gap-4 px-0 lg:px-4">
        {/* Left Panel - Controls */}
        <div className="veo3-panel-left bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-zinc-700/50 rounded-xl shadow-xl">
          <div className="veo3-panel-content p-6 space-y-4">
            {/* Mode Selector */}
            <ModeSelector
              mode={mode}
              onModeChange={handleModeChange}
              disabled={isGenerating}
              texts={t.mode_selector}
            />

            {/* Image Upload Zone (only in image-to-video mode) */}
            {mode === "image-to-video" && (
              <div className="space-y-4">
                {/* Image Upload Zone(s) */}
                {keyframeMode ? (
                  <div className="grid grid-cols-2 gap-3">
                    <ImageUploadZone
                      label={t.keyframe_mode?.start_frame || "首帧"}
                      onImageUpload={handleImageSelect}
                      currentImage={inputImagePreview}
                      disabled={isGenerating || isUploading}
                      pageData={pageData}
                    />
                    <ImageUploadZone
                      label={t.keyframe_mode?.end_frame || "尾帧"}
                      onImageUpload={handleEndImageSelect}
                      currentImage={endImagePreview}
                      disabled={isGenerating || isUploading}
                      pageData={pageData}
                    />
                  </div>
                ) : (
                  <ImageUploadZone
                    onImageUpload={handleImageSelect}
                    currentImage={inputImagePreview}
                    disabled={isGenerating || isUploading}
                    pageData={pageData}
                  />
                )}

                {/* Keyframe Mode Switch */}
                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-cyan-50 dark:from-green-950/20 dark:to-cyan-950/20 rounded-lg border border-green-200/50 dark:border-green-800/50">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor="keyframe-mode"
                          className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                          {t.keyframe_mode?.label || "首尾帧模式"}
                        </Label>
                        <Switch
                          id="keyframe-mode"
                          checked={keyframeMode}
                          onCheckedChange={setKeyframeMode}
                          disabled={isGenerating}
                        />
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <p className="leading-relaxed">
                        {t.keyframe_mode?.description ||
                          "您可以精确控制AI视频的开始和结束，允许您控制第一帧和最后一帧，创建流畅的电影过渡效果"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reference Images Upload Zone (only in reference-to-video mode) */}
            {mode === "reference-to-video" && (
              <div className="space-y-4">
                <MultiImageUploadZone
                  onImagesChange={handleReferenceImagesChange}
                  currentImages={referenceImagePreviews}
                  disabled={isGenerating || isUploading}
                  maxImages={3}
                  pageData={pageData}
                />

                {/* Reference Mode Notice */}
                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                      <p className="leading-relaxed font-medium">
                        {t.reference_mode?.notice ||
                          "Reference to Video mode only supports Fast Mode (veo3_fast) and 16:9 aspect ratio. Upload 1-3 reference images to guide the video generation."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Prompt Input */}
            <PromptInputZone
              prompt={prompt}
              onPromptChange={setPrompt}
              disabled={isGenerating}
              texts={t.prompt}
            />

            {/* Controls */}
            <Veo3Controls
              mode={mode}
              model={model}
              onModelChange={setModel}
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
              watermark={watermark}
              onWatermarkChange={setWatermark}
              seeds={seeds}
              onSeedsChange={setSeeds}
              enableTranslation={enableTranslation}
              onEnableTranslationChange={setEnableTranslation}
              disabled={isGenerating}
              texts={t.controls}
            />

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
                  {requiredCredits}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {pageData?.workspace?.controls?.credits_unit || "credits"}
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
                    requiredCredits
                  ) || `Generate Video (${requiredCredits} credits)`}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Panel - Output */}
        <div className="veo3-panel-right bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-zinc-700/50 rounded-xl shadow-xl">
          <div className="veo3-panel-content p-6">
            <VideoOutputDisplay
              task={currentTask}
              onUpgrade1080p={() => setShow1080pModal(true)}
              onDownload={handleDownload}
              isUpgrading={isUpgrading}
              downloadingQuality={downloadingQuality}
              emptyStateTexts={t.empty_state}
              processingStateTexts={t.processing_state}
              failedStateTexts={t.failed_state}
              completedStateTexts={t.completed_state}
            />

            {/* Action Buttons */}
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

      {/* 1080P Upgrade Modal */}
      <Upgrade1080pModal
        open={show1080pModal}
        onOpenChange={setShow1080pModal}
        onConfirm={handle1080pUpgrade}
        isUpgrading={isUpgrading}
        currentCredits={credits.left_credits}
        texts={t.upgrade_modal}
      />
    </div>
  );
}
