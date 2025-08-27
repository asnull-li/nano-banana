"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Upload, Image as ImageIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";

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

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // 处理被拒绝的文件
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach((file) => {
        if (file.errors?.[0]?.code === "file-too-large") {
          toast.error(`文件 ${file.file.name} 太大，最大支持 10MB`);
        } else if (file.errors?.[0]?.code === "file-invalid-type") {
          toast.error(`文件 ${file.file.name} 格式不支持`);
        }
      });
    }

    // 处理接受的文件
    if (acceptedFiles.length > 0) {
      if (acceptedFiles.length > remainingSlots) {
        toast.warning(`只能再上传 ${remainingSlots} 张图片`);
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
          <p className="text-lg font-medium mb-1">已达到最大图片数量</p>
          <p className="text-sm text-muted-foreground">
            最多可以上传 {maxFiles} 张图片
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
              {isDragActive ? "松开以上传图片" : "拖拽或点击上传图片"}
            </p>
            
            <p className="text-sm text-muted-foreground mb-1">
              支持 PNG, JPG, JPEG, WebP, GIF 格式
            </p>
            
            <p className="text-sm text-muted-foreground">
              单个文件最大 10MB，还可上传 {remainingSlots} 张
            </p>
            
            {currentCount > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                <ImageIcon className="h-4 w-4" />
                <span className="text-sm font-medium">
                  已选择 {currentCount}/{maxFiles} 张图片
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}