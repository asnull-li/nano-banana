"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadZoneProps {
  onImageUpload: (file: File, preview: string) => void;
  disabled?: boolean;
  currentImage?: string | null;
  className?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function ImageUploadZone({
  onImageUpload,
  disabled = false,
  currentImage,
  className,
}: ImageUploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === "file-too-large") {
          toast.error("File is too large. Maximum size is 10MB.");
          return;
        }
        toast.error("Invalid file type. Please upload an image.");
        return;
      }

      const file = acceptedFiles[0];
      if (file) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error("File is too large. Maximum size is 10MB.");
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = e.target?.result as string;
          onImageUpload(file, preview);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
    disabled,
  });

  const handleClearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Reset to empty state
    onImageUpload(new File([], ""), "");
  };

  return (
    <div className={className}>
      <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
        上传图片
      </h3>

      <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-green-300 dark:border-green-700 transition-all duration-300">
        {currentImage ? (
          // Preview State
          <div className="relative group h-48">
            <img
              src={currentImage}
              alt="Uploaded preview"
              className="w-full h-full object-contain bg-slate-50 dark:bg-slate-800"
            />
            {!disabled && (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <div
                    onClick={handleClearImage}
                    className="p-2 bg-red-500/90 backdrop-blur-sm text-white rounded-full hover:bg-red-600 hover:scale-110 transition-all duration-200 cursor-pointer shadow-lg"
                    title="删除图片"
                  >
                    <X className="w-4 h-4" />
                  </div>
                  <div {...getRootProps()} className="cursor-pointer">
                    <input {...getInputProps()} />
                    <div
                      className="p-2 bg-green-500/90 backdrop-blur-sm text-white rounded-full hover:bg-green-600 hover:scale-110 transition-all duration-200 shadow-lg"
                      title="替换图片"
                    >
                      <Upload className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          // Upload State
          <div
            {...getRootProps()}
            className={cn(
              "text-center cursor-pointer transition-all duration-300 h-32 flex items-center justify-center",
              isDragActive
                ? "border-green-500 bg-green-50/50 dark:bg-green-950/40 scale-[1.02]"
                : "border-green-300 dark:border-green-700",
              disabled
                ? "cursor-not-allowed opacity-50"
                : "hover:border-green-500 hover:bg-green-50/30 dark:hover:bg-green-950/30 hover:scale-[1.01]"
            )}
          >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                {isDragActive ? (
                  <Upload className="w-8 h-8 text-green-600 dark:text-green-400 animate-bounce" />
                ) : (
                  <div className="relative group">
                    <ImageIcon className="w-8 h-8 text-green-600 dark:text-green-400 transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-green-500/10 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                )}
                {isDragActive && (
                  <div className="absolute inset-0 bg-green-500/30 blur-lg rounded-full animate-pulse"></div>
                )}
              </div>

              <div className="space-y-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {isDragActive ? "释放上传" : "点击或拖拽上传"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  支持 PNG、JPG、JPEG、WEBP • 最大 10MB
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {disabled && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <div className="w-4 h-4 border-2 border-slate-300 border-t-green-500 rounded-full animate-spin"></div>
              <span className="text-sm">处理中...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
