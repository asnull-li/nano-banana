"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Compare } from "@/components/ui/compare";
import { Download, RotateCcw, X } from "lucide-react";
import { downloadImage, generateImageFilename } from "@/lib/download-utils";
import { useState } from "react";
import { toast } from "sonner";

interface CompareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalImage: string;
  upscaledImage: string;
  scale: number;
  faceEnhance: boolean;
  onReset?: () => void;
}

export default function CompareModal({
  open,
  onOpenChange,
  originalImage,
  upscaledImage,
  scale,
  faceEnhance,
  onReset,
}: CompareModalProps) {
  const [isDownloadingOriginal, setIsDownloadingOriginal] = useState(false);
  const [isDownloadingUpscaled, setIsDownloadingUpscaled] = useState(false);

  const handleDownloadOriginal = async () => {
    try {
      setIsDownloadingOriginal(true);
      await downloadImage(originalImage, {
        filename: `${generateImageFilename("upscaler", "generated")}.jpg`,
        onStart: () => toast.info("准备下载原图..."),
        onComplete: () => toast.success("原图下载成功!"),
      });
    } catch (error) {
      toast.error("原图下载失败");
      console.error("Download original error:", error);
    } finally {
      setIsDownloadingOriginal(false);
    }
  };

  const handleDownloadUpscaled = async () => {
    try {
      setIsDownloadingUpscaled(true);
      await downloadImage(upscaledImage, {
        filename: `${generateImageFilename("upscaler", "edited")}.jpg`,
        onStart: () => toast.info("准备下载放大图..."),
        onComplete: () => toast.success("放大图下载成功!"),
      });
    } catch (error) {
      toast.error("放大图下载失败");
      console.error("Download upscaled error:", error);
    } finally {
      setIsDownloadingUpscaled(false);
    }
  };

  const handleReset = () => {
    onOpenChange(false);
    onReset?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-0 gap-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-green-200/50 dark:border-green-800/50 flex flex-col">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-green-200/30 dark:border-green-800/30">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full animate-pulse"></div>
              AI 图片对比
            </DialogTitle>
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
            <div className="absolute z-20 top-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium animate-pulse pointer-events-none ">
              ↔️ 拖拽分割线对比图片
            </div>
          </div>

          {/* Info and Actions Bar */}
          {/* <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-green-200/30 dark:border-green-800/30 backdrop-blur-sm flex-shrink-0">
          
            <div className="flex flex-wrap items-center gap-3">
              <Badge 
                variant="secondary" 
                className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              >
                🔍 Scale: {scale}x
              </Badge>
              <Badge 
                variant="secondary"
                className={`${
                  faceEnhance 
                    ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' 
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                👤 Face Enhancement: {faceEnhance ? 'ON' : 'OFF'}
              </Badge>
              <Badge 
                variant="secondary" 
                className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
              >
                ⚡ Provider: KIE
              </Badge>
            </div>

        
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadOriginal}
                disabled={isDownloadingOriginal}
                className="bg-white/80 dark:bg-slate-800/80 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950/30 hover:scale-105 transition-all duration-200"
              >
                {isDownloadingOriginal ? (
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-green-500 rounded-full animate-spin mr-2" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                下载原图
              </Button>

              <Button
                size="sm"
                onClick={handleDownloadUpscaled}
                disabled={isDownloadingUpscaled}
                className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white shadow-lg hover:scale-105 transition-all duration-200"
              >
                {isDownloadingUpscaled ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                下载放大图
              </Button>

              {onReset && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="bg-white/80 dark:bg-slate-800/80 border-orange-200 hover:bg-orange-50 text-orange-600 dark:border-orange-800 dark:hover:bg-orange-950/30 hover:scale-105 transition-all duration-200"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  重新处理
                </Button>
              )}
            </div>
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
