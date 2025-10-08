"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Download,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Copy,
  CheckCircle,
  Video,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

interface ImagePreviewDialogProps {
  images: string[] | null;
  onClose: () => void;
  onDownload: (url: string) => Promise<void>;
}

export default function ImagePreviewDialog({
  images,
  onClose,
  onDownload,
}: ImagePreviewDialogProps) {
  const t = useTranslations("history");
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!images || images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleCopyLink = async (url: string, index: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedIndex(index);
      toast.success(t("link_copied"));
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast.error(t("copy_failed"));
    }
  };

  const handleEnhance = () => {
    if (!currentImage) {
      toast.error(t("no_image_selected") || "No image selected");
      return;
    }

    try {
      // 验证图片URL是否有效
      new URL(currentImage);

      // 将当前图片URL作为查询参数，跳转到AI图像放大器页面
      const searchParams = new URLSearchParams();
      searchParams.set("imageUrl", currentImage);

      // toast.info(t("redirecting_to_upscaler") || "Redirecting to image upscaler...");
      router.push(`/ai-image-upscaler?${searchParams.toString()}`);
      onClose();
    } catch (error) {
      console.error("Invalid image URL:", error);
      toast.error(t("invalid_image_url") || "Invalid image URL");
    }
  };

  const handleImageToVideo = () => {
    if (!currentImage) {
      toast.error(t("no_image_selected") || "No image selected");
      return;
    }

    try {
      // 验证图片URL是否有效
      new URL(currentImage);

      // 将当前图片URL作为查询参数，跳转到veo3页面
      const searchParams = new URLSearchParams();
      searchParams.set("imageUrl", currentImage);

      router.push(`/veo3?${searchParams.toString()}`);
      onClose();
    } catch (error) {
      console.error("Invalid image URL:", error);
      toast.error(t("invalid_image_url") || "Invalid image URL");
    }
  };

  return (
    <Dialog open={!!images} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-4 pb-2 flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span>
              {t("image_preview")}
              {hasMultipleImages && (
                <span className="ml-2 text-sm text-muted-foreground">
                  ({currentIndex + 1} / {images.length})
                </span>
              )}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0">
          {/* 图片容器 - 计算可用高度 */}
          <div
            className="relative flex items-center justify-center bg-muted/20 overflow-hidden"
            style={{
              height: hasMultipleImages
                ? "calc(100vh - 280px)" // 为header + 操作按钮 + 缩略图预留空间
                : "calc(100vh - 200px)", // 为header + 操作按钮预留空间
            }}
          >
            <img
              src={currentImage}
              alt={`Preview ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* 左右切换按钮 */}
            {hasMultipleImages && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevious}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8 sm:h-10 sm:w-10"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8 sm:h-10 sm:w-10"
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
              </>
            )}
          </div>

          {/* 操作区域 - 固定在底部 */}
          <div className="flex-shrink-0 p-3 sm:p-4 bg-gradient-to-t from-slate-50 to-transparent dark:from-slate-900 dark:to-transparent border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-2 justify-center">
              {/* 下载按钮 */}
              <Button
                size="sm"
                className="flex-1 min-w-[100px] max-w-[150px] bg-gradient-to-r from-green-500 to-cyan-500 text-white hover:from-green-600 hover:to-cyan-600 shadow-lg shadow-green-500/25 text-xs sm:text-sm"
                onClick={() => onDownload(currentImage)}
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{t("download")}</span>
                <span className="sm:hidden">{t("download")}</span>
              </Button>

              {/* 图像增强按钮 */}
              <Button
                size="sm"
                className="flex-1 min-w-[100px] max-w-[150px] bg-gradient-to-r from-green-500 to-cyan-500 text-white hover:from-green-600 hover:to-cyan-600 shadow-lg shadow-green-500/25 text-xs sm:text-sm"
                onClick={handleEnhance}
              >
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{t("enhance_image")}</span>
                <span className="sm:hidden">{t("enhance_image")}</span>
              </Button>

              {/* 图生视频按钮 */}
              <Button
                size="sm"
                className="flex-1 min-w-[100px] max-w-[150px] bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-blue-500/25 text-xs sm:text-sm"
                onClick={handleImageToVideo}
              >
                <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{t("image_to_video")}</span>
                <span className="sm:hidden">{t("i2v")}</span>
              </Button>

              {/* 复制链接按钮 */}
              <Button
                size="sm"
                variant="outline"
                className="flex-1 min-w-[100px] max-w-[150px] border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm"
                onClick={() => handleCopyLink(currentImage, currentIndex)}
              >
                {copiedIndex === currentIndex ? (
                  <>
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-green-400" />
                    <span className="hidden sm:inline">{t("copied")}</span>
                    <span className="sm:hidden">✓</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{t("copy_link")}</span>
                    <span className="sm:hidden">{t("copy_link")}</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* 缩略图列表 - 固定高度，不影响图片显示空间 */}
          {hasMultipleImages && (
            <div className="p-3 sm:p-4 border-t flex-shrink-0">
              <div className="flex gap-2 justify-center overflow-x-auto">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`relative flex-shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentIndex
                        ? "border-green-500 shadow-lg shadow-green-500/25"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs py-0.5 text-center">
                      {index + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
