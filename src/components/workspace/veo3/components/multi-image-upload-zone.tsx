"use client";

import { useCallback, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ImageItem {
  file: File;
  preview: string;
}

interface MultiImageUploadZoneProps {
  onImagesChange: (files: File[], previews: string[]) => void;
  currentImages?: string[];
  disabled?: boolean;
  maxImages?: number;
  pageData?: any;
}

export default function MultiImageUploadZone({
  onImagesChange,
  currentImages = [],
  disabled = false,
  maxImages = 3,
  pageData,
}: MultiImageUploadZoneProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const t = pageData?.workspace?.upload_zone || {};

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || disabled) return;

      const fileArray = Array.from(files);
      const remainingSlots = maxImages - images.length;
      const filesToAdd = fileArray.slice(0, remainingSlots);

      const newImages: ImageItem[] = [];
      const validFiles: File[] = [];

      filesToAdd.forEach((file) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
          return;
        }

        const preview = URL.createObjectURL(file);
        newImages.push({ file, preview });
        validFiles.push(file);
      });

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);

      // Call parent callback
      onImagesChange(
        updatedImages.map((img) => img.file),
        updatedImages.map((img) => img.preview)
      );
    },
    [images, disabled, maxImages, onImagesChange]
  );

  const handleRemoveImage = useCallback(
    (index: number) => {
      const imageToRemove = images[index];

      // Revoke blob URL
      if (imageToRemove.preview.startsWith("blob:")) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      const updatedImages = images.filter((_, i) => i !== index);
      setImages(updatedImages);

      // Call parent callback
      onImagesChange(
        updatedImages.map((img) => img.file),
        updatedImages.map((img) => img.preview)
      );
    },
    [images, onImagesChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files);
      // Reset input value to allow selecting the same file again
      e.target.value = "";
    },
    [handleFileSelect]
  );

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-3">
      {/* Upload Button / Drop Zone */}
      {canAddMore && (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg transition-all duration-200",
            isDragging
              ? "border-green-500 bg-green-50 dark:bg-green-950/20"
              : "border-slate-300 dark:border-slate-600 hover:border-green-400 dark:hover:border-green-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label
            className={cn(
              "flex flex-col items-center justify-center py-6 cursor-pointer",
              disabled && "cursor-not-allowed"
            )}
          >
            <Upload className="w-8 h-8 mb-2 text-slate-400" />
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              {t.click_or_drag || "Click or drag to upload"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              {`${images.length}/${maxImages} images`}
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleInputChange}
              disabled={disabled}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Image Previews Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 group"
            >
              <img
                src={image.preview}
                alt={`Reference ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemoveImage(index)}
                  disabled={disabled}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {t.supported_formats || "Supported formats: JPEG, PNG, WebP"} • {t.max_size || "Max 10MB per image"}
      </p>
    </div>
  );
}
