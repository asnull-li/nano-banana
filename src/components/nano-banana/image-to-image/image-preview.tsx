"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { UploadedImage } from "../hooks/use-nano-banana";

interface ImagePreviewProps {
  images: UploadedImage[];
  onRemove: (imageId: string) => void;
  onClearAll?: () => void;
  disabled?: boolean;
}

export default function ImagePreview({
  images,
  onRemove,
  onClearAll,
  disabled = false,
}: ImagePreviewProps) {
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const t = useTranslations();

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent">
            {t("nano_banana.image_to_image.selected_references")}
          </h3>
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-green-500/10 to-cyan-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
            {images.length}/5
          </span>
        </div>
        {images.length > 0 && onClearAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            disabled={disabled}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            {t("nano_banana.image_to_image.clear_all")}
          </Button>
        )}
      </div>

      {/* 图片网格 - PC端一行4张 */}
      <div
        className={cn(
          "grid gap-3",
          "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4"
        )}
      >
        {images.map((image) => (
          <Card
            key={image.id}
            className={cn(
              "group relative overflow-hidden transition-all duration-300",
              "hover:shadow-lg hover:shadow-green-500/10",
              image.uploadProgress > 0 &&
                image.uploadProgress < 100 &&
                "animate-pulse",
              disabled && "opacity-50"
            )}
          >
            {/* 图片预览 */}
            <div className="aspect-square relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
              <img
                src={image.preview}
                alt="Uploaded"
                className={cn(
                  "w-full h-full object-cover transition-transform duration-300",
                  !disabled && "group-hover:scale-105"
                )}
              />

              {/* 上传进度遮罩 - 只在实际上传时显示 */}
              {image.uploadProgress > 0 && image.uploadProgress < 100 && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="relative">
                      <Loader2 className="h-8 w-8 text-green-400 animate-spin mx-auto" />
                      <div className="absolute inset-0 h-8 w-8 bg-green-500/20 rounded-full animate-ping mx-auto" />
                    </div>
                    <p className="text-sm font-semibold text-white mt-2">
                      {image.uploadProgress}%
                    </p>
                    <p className="text-xs text-white/80 mt-0.5">
                      {t("nano_banana.image_to_image.uploading")}
                    </p>
                  </div>
                </div>
              )}

              {/* 操作按钮 - 优化布局 */}
              {!disabled && (
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent",
                    "opacity-0 group-hover:opacity-100 transition-all duration-200",
                    "flex items-end justify-between p-3"
                  )}
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 bg-white/90 hover:bg-white text-slate-700 backdrop-blur-sm rounded-full shadow-lg"
                    onClick={() => setPreviewImage(image.preview)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 bg-red-500/90 hover:bg-red-600 text-white backdrop-blur-sm rounded-full shadow-lg"
                    onClick={() => onRemove(image.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* 状态指示器 - 完成上传 */}
              {image.uploadProgress === 100 && image.url && (
                <div className="absolute top-2 right-2">
                  <div className="p-1 rounded-full bg-gradient-to-r from-green-500 to-cyan-500 shadow-lg">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </div>

            {/* 上传进度条 - 更醒目的样式 */}
            {image.uploadProgress > 0 && image.uploadProgress < 100 && (
              <Progress
                value={image.uploadProgress}
                className="absolute bottom-0 left-0 right-0 h-1.5 rounded-none [&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-cyan-500"
              />
            )}

            {/* 文件信息栏 */}
            <div className="p-2 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
              <p className="text-xs text-muted-foreground truncate font-medium">
                {image.file?.name || "图片链接"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {image.file ? (image.file.size / 1024 / 1024).toFixed(2) + " MB" : "从链接"}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* 全屏预览 */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setPreviewImage(null)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
