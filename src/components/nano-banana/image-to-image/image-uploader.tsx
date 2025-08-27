"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Upload, Image as ImageIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface ImageUploaderProps {
  onFilesSelected: (files: File[]) => void;
  currentCount: number;
  maxFiles?: number;
  disabled?: boolean;
}

export default function ImageUploader({ 
  onFilesSelected, 
  currentCount, 
  maxFiles = 10,
  disabled = false 
}: ImageUploaderProps) {
  const remainingSlots = maxFiles - currentCount;
  const t = useTranslations();

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // 处理被拒绝的文件
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach((file) => {
        if (file.errors?.[0]?.code === "file-too-large") {
          toast.error(t("nano_banana.image_to_image.file_too_large", { filename: file.file.name }));
        } else if (file.errors?.[0]?.code === "file-invalid-type") {
          toast.error(t("nano_banana.image_to_image.unsupported_format", { filename: file.file.name }));
        }
      });
    }

    // 处理接受的文件
    if (acceptedFiles.length > 0) {
      if (acceptedFiles.length > remainingSlots) {
        toast.warning(t("nano_banana.image_to_image.can_only_upload", { count: remainingSlots }));
        onFilesSelected(acceptedFiles.slice(0, remainingSlots));
      } else {
        onFilesSelected(acceptedFiles);
      }
    }
  }, [onFilesSelected, remainingSlots]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"],
    },
    maxFiles: remainingSlots,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: disabled || remainingSlots === 0,
  });

  if (remainingSlots === 0) {
    return (
      <Card className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
          <p className="text-lg font-medium mb-1">{t("nano_banana.image_to_image.max_images_reached")}</p>
          <p className="text-sm text-muted-foreground">
            {t("nano_banana.image_to_image.max_upload_limit", { max: maxFiles })}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative cursor-pointer transition-all duration-300",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <input {...getInputProps()} />
      <Card
        className={cn(
          "p-8 border-2 border-dashed transition-all duration-300",
          isDragActive
            ? "border-green-500 bg-gradient-to-br from-green-500/10 to-cyan-500/10 scale-[1.02]"
            : "border-green-500/30 hover:border-green-500/50 hover:bg-gradient-to-br hover:from-green-500/5 hover:to-cyan-500/5",
          disabled && "hover:border-green-500/30 hover:bg-transparent"
        )}
      >
        <div className="relative">
          {/* 背景渐变动画 */}
          {isDragActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-cyan-500/10 animate-pulse rounded-lg" />
          )}
          
          <div className="relative z-10 text-center">
            <div className="flex justify-center mb-4">
              {isDragActive ? (
                <div className="relative">
                  <ImageIcon className="h-16 w-16 text-green-500 animate-bounce" />
                  <div className="absolute inset-0 h-16 w-16 bg-green-500/20 rounded-full animate-ping" />
                </div>
              ) : (
                <Upload className="h-16 w-16 text-green-500" />
              )}
            </div>
            
            <p className="text-lg font-semibold mb-2">
              {isDragActive ? t("nano_banana.image_to_image.release_to_upload") : t("nano_banana.image_to_image.drag_drop_upload")}
            </p>
            
            <p className="text-sm text-muted-foreground mb-1">
              {t("nano_banana.image_to_image.supported_formats")}
            </p>
            
            <p className="text-sm text-muted-foreground">
              {t("nano_banana.image_to_image.max_file_size", { remaining: remainingSlots })}
            </p>
            
            {currentCount > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                <ImageIcon className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {t("nano_banana.image_to_image.selected_count", { current: currentCount, max: maxFiles })}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}