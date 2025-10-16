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
  pageData?: any;
  label?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function ImageUploadZone({
  onImageUpload,
  disabled = false,
  currentImage,
  className,
  pageData,
  label,
}: ImageUploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === "file-too-large") {
          toast.error(
            pageData?.workspace?.upload_zone?.error_file_too_large ||
              "File is too large. Maximum size is 10MB."
          );
          return;
        }
        toast.error(
          pageData?.workspace?.upload_zone?.error_invalid_type ||
            "Invalid file type. Please upload an image."
        );
        return;
      }

      const file = acceptedFiles[0];
      if (file) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(
            pageData?.workspace?.upload_zone?.error_file_too_large ||
              "File is too large. Maximum size is 10MB."
          );
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
      <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-green-300 dark:border-green-600 transition-all duration-300">
        {currentImage ? (
          // Preview State
          <div className="relative group h-48">
            <img
              src={currentImage}
              alt={
                pageData?.workspace?.upload_zone?.preview_alt ||
                "Uploaded preview"
              }
              className="w-full h-full object-contain bg-slate-100 dark:bg-slate-800 transition-transform duration-300 group-hover:scale-110"
            />
            {!disabled && (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    onClick={handleClearImage}
                    className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 hover:scale-110 transition-all duration-200 cursor-pointer"
                    title={
                      pageData?.workspace?.upload_zone?.delete_tooltip ||
                      "删除图片"
                    }
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div {...getRootProps()} className="cursor-pointer">
                    <input {...getInputProps()} />
                    <button
                      className="p-1.5 bg-green-500 text-white rounded-full hover:bg-green-600 hover:scale-110 transition-all duration-200"
                      title={
                        pageData?.workspace?.upload_zone?.replace_tooltip ||
                        "替换图片"
                      }
                    >
                      <Upload className="w-3 h-3" />
                    </button>
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
              "h-32 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center space-y-3 group",
              isDragActive
                ? "border-green-400 bg-green-50 dark:bg-green-950/20 scale-105"
                : "hover:border-green-400 hover:bg-green-50/50 dark:hover:bg-green-950/10",
              disabled && "opacity-50 pointer-events-none"
            )}
          >
            <input {...getInputProps()} />

            <div className={cn(
              "p-3 rounded-full transition-all duration-300",
              "bg-green-100 dark:bg-green-900/30",
              "group-hover:bg-green-200 dark:group-hover:bg-green-800/50",
              "group-hover:scale-110"
            )}>
              <Upload className={cn(
                "h-4 w-4 text-green-500 transition-transform duration-300",
                "group-hover:rotate-12"
              )} />
            </div>

            <div className="text-center">
              <p className="text-xs font-medium text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300">
                {label || pageData?.workspace?.upload_zone?.title || "Add Image"}
              </p>
              <p className="text-[10px] text-green-500 dark:text-green-500">
                JPG, PNG, WebP
              </p>
              <p className="text-[10px] text-green-500 dark:text-green-500">
                Max 10MB
              </p>
            </div>

            {/* 拖拽激活指示器 */}
            {isDragActive && (
              <div className="absolute inset-0 rounded-xl bg-green-400/20 flex items-center justify-center">
                <div className="text-green-600 font-medium animate-bounce">
                  {pageData?.workspace?.upload_zone?.drop_text || "Release to Upload"}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading Overlay */}
        {disabled && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <div className="w-4 h-4 border-2 border-slate-300 border-t-green-500 rounded-full animate-spin"></div>
              <span className="text-sm">
                {pageData?.workspace?.upload_zone?.processing || "处理中..."}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
