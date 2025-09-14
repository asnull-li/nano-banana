"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Compare } from "@/components/ui/compare";

interface CompareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalImage: string;
  upscaledImage: string;
  scale: number;
  faceEnhance: boolean;
  onReset?: () => void;
  pageData?: any;
}

export default function CompareModal({
  open,
  onOpenChange,
  originalImage,
  upscaledImage,
  pageData,
}: CompareModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-0 gap-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-green-200/50 dark:border-green-800/50 flex flex-col">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-green-200/30 dark:border-green-800/30">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full animate-pulse"></div>
              {pageData?.compare_modal?.title || "AI 图片对比"}
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
              {pageData?.compare_modal?.drag_hint || "↔️ 拖拽分割线对比图片"}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
