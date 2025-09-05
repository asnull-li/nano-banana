"use client";

import React from "react";
import ImageUploader from "./image-uploader";
import ImagePreview from "./image-preview";
import EditControls from "./edit-controls";
import MultiImageTip from "./multi-image-tip";
import type { UploadedImage } from "../hooks/use-nano-banana";

interface ImageToImageModeProps {
  uploadedImages: UploadedImage[];
  prompt: string;
  status: string;
  onAddImages: (files: File[]) => void;
  onRemoveImage: (imageId: string) => void;
  onClearImages: () => void;
  onPromptChange: (prompt: string) => void;
  onSubmit: () => void;
}

export default function ImageToImageMode({
  uploadedImages,
  prompt,
  status,
  onAddImages,
  onRemoveImage,
  onClearImages,
  onPromptChange,
  onSubmit,
}: ImageToImageModeProps) {
  const isProcessing = ["uploading", "processing", "fetching"].includes(status);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 左侧 - 图片上传和预览 */}
      <div className="space-y-4">
        {/* 上传区域 */}
        <ImageUploader
          onFilesSelected={onAddImages}
          currentCount={uploadedImages.length}
          maxFiles={10}
          disabled={isProcessing}
        />
        
        {/* 多图提示 - 只在没有选择图片时显示 */}
        {uploadedImages.length === 0 && (
          <MultiImageTip />
        )}
        
        {/* 图片预览 */}
        {uploadedImages.length > 0 && (
          <ImagePreview
            images={uploadedImages}
            onRemove={onRemoveImage}
            onClearAll={onClearImages}
            disabled={isProcessing}
          />
        )}
      </div>

      {/* 右侧 - 控制面板 */}
      <div>
        <EditControls
          prompt={prompt}
          onPromptChange={onPromptChange}
          onSubmit={onSubmit}
          isProcessing={isProcessing}
          disabled={uploadedImages.length === 0}
        />
      </div>
    </div>
  );
}
