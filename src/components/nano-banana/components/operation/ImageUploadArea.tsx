import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, X } from "lucide-react";
import { useDropzone, FileRejection } from "react-dropzone";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ImageCard from "./ImageCard";

interface UploadedImage {
  id: string;
  preview: string;
  file: File;
  uploadProgress?: number;
}

interface ImageUploadAreaProps {
  uploadedImages: UploadedImage[];
  onAddImages: (files: File[]) => void;
  onRemoveImage: (id: string) => void;
  onClearImages: () => void;
  disabled?: boolean;
}

export default function ImageUploadArea({
  uploadedImages,
  onAddImages,
  onRemoveImage,
  onClearImages,
  disabled = false,
}: ImageUploadAreaProps) {
  // 处理被拒绝的文件
  const handleDropRejected = (fileRejections: FileRejection[]) => {
    fileRejections.forEach((rejection) => {
      const { file, errors } = rejection;

      errors.forEach((error) => {
        let errorMessage = `${file.name}: `;

        switch (error.code) {
          case "file-invalid-type":
            errorMessage += "不支持的文件格式，仅支持 JPG、PNG、WebP";
            break;
          case "file-too-large":
            errorMessage += `文件大小超过 10MB 限制`;
            break;
          case "too-many-files":
            errorMessage += "一次最多上传5个文件";
            break;
          default:
            errorMessage += error.message;
        }

        toast.error(errorMessage);
      });
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => onAddImages(acceptedFiles),
    onDropRejected: handleDropRejected,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    disabled: disabled,
    multiple: true,
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          参考图片
        </h3>
        {uploadedImages.length > 0 && (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-700">
            {uploadedImages.length}/5
          </Badge>
        )}
      </div>

      {/* 卡片式图片网格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* 已上传的图片 */}
        {uploadedImages.map((img, index) => (
          <ImageCard
            key={img.id}
            image={img}
            index={index}
            onRemove={onRemoveImage}
            disabled={disabled}
          />
        ))}

        {/* 添加图片卡片 */}
        {uploadedImages.length < 5 && (
          <div
            {...getRootProps()}
            className={cn(
              "add-image-card aspect-square rounded-xl border-2 border-dashed transition-all cursor-pointer",
              "flex flex-col items-center justify-center space-y-3 group",
              isDragActive
                ? "border-green-400 bg-green-50 dark:bg-green-950/20 scale-105"
                : "border-green-300 dark:border-green-600 hover:border-green-400 hover:bg-green-50/50 dark:hover:bg-green-950/10",
              disabled && "opacity-50 pointer-events-none"
            )}
          >
            <input {...getInputProps()} />
            <div
              className={cn(
                "p-3 rounded-full transition-all duration-300",
                "bg-green-100 dark:bg-green-900/30",
                "group-hover:bg-green-200 dark:group-hover:bg-green-800/50",
                "group-hover:scale-110"
              )}
            >
              <Upload
                className={cn(
                  "h-4 w-4 text-green-500 transition-transform duration-300",
                  "group-hover:rotate-12"
                )}
              />
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300">
                Add Image
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
                  释放文件
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 提示信息 */}
      {/* <div className="custom-card custom-card-info">
        <div className="flex items-start gap-2">
          <Camera className="h-4 w-4 text-blue-500 mt-0.5" />
          <div className="text-xs text-blue-600 dark:text-blue-400">
            <p className="font-medium mb-1">多图提示</p>
            <p>支持上传多张参考图片，AI 将根据所有图片进行创作。支持 PNG、JPG、WEBP 格式。</p>
          </div>
        </div>
      </div> */}

      {/* 清空按钮 */}
      {uploadedImages.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearImages}
          disabled={disabled}
          className="w-full text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20"
        >
          <X className="h-4 w-4 mr-2" />
          清空所有图片
        </Button>
      )}
    </div>
  );
}
