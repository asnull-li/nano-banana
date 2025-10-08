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
        <DialogHeader className="p-6 pb-4 border-b border-green-200/30 dark:border-green-800/30">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full animate-pulse"></div>
              {t("compare_title")}
            </DialogTitle>

            {/* Info badges */}
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20 flex items-center gap-1">
                <ZoomIn className="h-3 w-3" />
                {t("scale")}: {scale}x
              </Badge>
              {faceEnhance && (
                <Badge className="bg-cyan-500/10 text-cyan-600 border-cyan-500/20 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {t("face_enhance")}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Main Content */}
        <div className="flex-1 flex flex-col p-6 gap-4 min-h-0">
          {/* Compare Display */}
          <div className="flex-1 relative bg-white/50 dark:bg-slate-800/50 rounded-xl border border-green-200/30 dark:border-green-800/30 shadow-inner overflow-hidden">
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
            <div className="absolute z-20 top-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium animate-pulse pointer-events-none">
              {t("drag_hint") || "拖拽分割线对比图片"}
            </div>
          </div>

          {/* Download Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() =>
                handleDownload(originalImage, "original-image.png")
              }
              variant="outline"
              className="hover:bg-green-500/10 hover:border-green-500/30"
            >
              <Download className="mr-2 h-4 w-4" />
              {t("download_original") || "下载原图"}
            </Button>
            <Button
              onClick={() =>
                handleDownload(upscaledImage, `upscaled-${scale}x.png`)
              }
              className="bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700"
            >
              <Download className="mr-2 h-4 w-4" />
              {t("download_enhanced") || "下载增强图"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
