"use client";

import React from "react";
import { useCredits } from "@/hooks/use-credits";
import { useAppContext } from "@/contexts/app";
import { CREDITS_PER_IMAGE } from "@/lib/constants/nano-banana";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

// 导入子组件
import ModeSelector from "./operation/ModeSelector";
import ImageUploadArea from "./operation/ImageUploadArea";
import PromptInput from "./operation/PromptInput";
import ImageSizeSelector from "./operation/ImageSizeSelector";
import CreditsDisplay from "./operation/CreditsDisplay";
import GenerateButton from "./operation/GenerateButton";

import type { UploadedImage } from "../hooks/use-nano-banana";

interface OperationPanelProps {
  mode: "image-to-image" | "text-to-image";
  uploadedImages: UploadedImage[];
  prompt: string;
  status: string;
  imageSize: string;
  onModeChange: (mode: "image-to-image" | "text-to-image") => void;
  onAddImages: (files: File[]) => void;
  onRemoveImage: (id: string) => void;
  onClearImages: () => void;
  onPromptChange: (prompt: string) => void;
  onImageSizeChange: (size: string) => void;
  onSubmit: () => void;
}

export default function OperationPanel({
  mode,
  uploadedImages,
  prompt,
  status,
  imageSize,
  onModeChange,
  onAddImages,
  onRemoveImage,
  onClearImages,
  onPromptChange,
  onImageSizeChange,
  onSubmit,
}: OperationPanelProps) {
  const { credits } = useCredits();
  const { user, setShowSignModal } = useAppContext();
  const router = useRouter();
  const t = useTranslations("nano_banana.workspace.operation_panel");

  const isProcessing = ["uploading", "processing", "fetching"].includes(status);
  const hasEnoughCredits = credits.left_credits >= CREDITS_PER_IMAGE;
  const canSubmit =
    prompt.trim().length >= 3 &&
    !isProcessing &&
    (mode === "text-to-image" || uploadedImages.length > 0);

  const handleSubmit = () => {
    if (!user) {
      toast.warning(t("login_required"));
      setShowSignModal(true);
      return;
    }

    if (!hasEnoughCredits) {
      toast.warning(t("insufficient_credits", { amount: CREDITS_PER_IMAGE }));
      router.push("/pricing");
      return;
    }

    onSubmit();
  };

  const handleNavigateToPricing = () => {
    router.push("/pricing");
  };

  return (
    <div className="h-full flex flex-col">
      {/* 滚动内容区 */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* 模式选择 */}
        <ModeSelector
          mode={mode}
          onModeChange={onModeChange}
          disabled={isProcessing}
        />

        {/* 图片上传区 (仅图片编辑模式) */}
        <div style={{ display: mode === "image-to-image" ? "block" : "none" }}>
          <ImageUploadArea
            uploadedImages={uploadedImages}
            onAddImages={onAddImages}
            onRemoveImage={onRemoveImage}
            onClearImages={onClearImages}
            disabled={isProcessing}
          />
        </div>

        {/* 提示词输入 */}
        <PromptInput
          mode={mode}
          prompt={prompt}
          onPromptChange={onPromptChange}
          disabled={isProcessing}
        />

        {/* 图片尺寸选择 */}
        <ImageSizeSelector
          value={imageSize}
          onChange={onImageSizeChange}
          disabled={isProcessing}
        />

        {/* 积分显示 */}
        <CreditsDisplay creditsPerImage={CREDITS_PER_IMAGE} />
      </div>

      {/* 底部操作按钮 */}
      <GenerateButton
        canSubmit={canSubmit}
        isProcessing={isProcessing}
        creditsPerImage={CREDITS_PER_IMAGE}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
