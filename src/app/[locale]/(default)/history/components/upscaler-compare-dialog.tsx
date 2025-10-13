"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Compare } from "@/components/ui/compare";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Sparkles, ZoomIn } from "lucide-react";
import { useTranslations } from "next-intl";

interface UpscalerCompareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  originalImage: string;
  upscaledImage: string;
  scale: number;
  faceEnhance: boolean;
}

export default function UpscalerCompareDialog({
  isOpen,
  onClose,
  originalImage,
  upscaledImage,
  scale,
  faceEnhance,
}: UpscalerCompareDialogProps) {
  const t = useTranslations("history.upscaler");

  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-0 gap-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-green-200/50 dark:border-green-800/50 flex flex-col">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-green-200/30 dark:border-green-800/30">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <DialogTitle className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full animate-pulse"></div>
              {t("compare_title")}
            </DialogTitle>

            {/* Info badges */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20 flex items-center gap-1 text-xs">
                <ZoomIn className="h-3 w-3" />
                {t("scale")}: {scale}x
              </Badge>
              {faceEnhance && (
                <Badge className="bg-cyan-500/10 text-cyan-600 border-cyan-500/20 flex items-center gap-1 text-xs">
                  <Sparkles className="h-3 w-3" />
                  {t("face_enhance")}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Main Content */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 gap-3 sm:gap-4 min-h-0">
          {/* Compare Display */}
          <div className="flex-1 relative bg-white/50 dark:bg-slate-800/50 rounded-lg sm:rounded-xl border border-green-200/30 dark:border-green-800/30 shadow-inner overflow-hidden">
            <Compare
              firstImage={originalImage}
              secondImage={upscaledImage}
              firstImageClassName="object-contain w-full h-full"
              secondImageClassName="object-contain w-full h-full"
              className="w-full h-full"
              slideMode="drag"
              firstImageLabel="Original"
              secondImageLabel="AI Enhanced"
            />

            {/* Floating Compare Hint */}
            <div className="absolute z-20 top-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium animate-pulse pointer-events-none">
              {t("drag_hint") || "拖拽分割线对比图片"}
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2 sm:gap-3">
            <Button
              onClick={() =>
                handleDownload(originalImage, "original-image.png")
              }
              variant="outline"
              className="hover:bg-green-500/10 hover:border-green-500/30 text-xs sm:text-sm"
            >
              <Download className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {t("download_original") || "下载原图"}
            </Button>
            <Button
              onClick={() =>
                handleDownload(upscaledImage, `upscaled-${scale}x.png`)
              }
              className="bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white text-xs sm:text-sm"
            >
              <Download className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {t("download_enhanced") || "下载增强图"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
