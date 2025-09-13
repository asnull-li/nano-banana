import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Result {
  url: string;
}

interface ImageViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  results: Result[];
  selectedResult: number;
  onSelect: (index: number) => void;
  onDownload?: () => void;
}

export default function ImageViewerDialog({
  isOpen,
  onClose,
  results,
  selectedResult,
  onSelect,
  onDownload,
}: ImageViewerDialogProps) {
  const router = useRouter();
  const currentResult = results[selectedResult];

  // 处理图片增强
  const handleEnhance = () => {
    if (!currentResult?.url) {
      toast.error("未找到图片");
      return;
    }

    try {
      // 验证图片URL是否有效
      new URL(currentResult.url);

      // 将当前图片URL作为查询参数，跳转到AI图像放大器页面
      const searchParams = new URLSearchParams();
      searchParams.set("imageUrl", currentResult.url);

      router.push(`/ai-image-upscaler?${searchParams.toString()}`);
      onClose();
    } catch (error) {
      console.error("Invalid image URL:", error);
      toast.error("无效的图片链接");
    }
  };

  // 处理左右导航
  const handlePrevious = () => {
    const newIndex =
      selectedResult > 0 ? selectedResult - 1 : results.length - 1;
    onSelect(newIndex);
  };

  const handleNext = () => {
    const newIndex =
      selectedResult < results.length - 1 ? selectedResult + 1 : 0;
    onSelect(newIndex);
  };

  // 键盘导航支持
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          handlePrevious();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleNext();
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedResult, results.length]);

  if (!currentResult) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 border-0 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden"
        onPointerDownOutside={onClose}
      >
        <DialogTitle className="sr-only">图片预览</DialogTitle>
        <DialogDescription className="sr-only">
          图片预览弹窗，第 {selectedResult + 1} 张，共 {results.length} 张
        </DialogDescription>

        <div className="relative bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden flex flex-col">
          {/* 顶部计数器 */}
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-gray-900/80 dark:bg-gray-700/80 text-white text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm">
              {selectedResult + 1} / {results.length}
            </div>
          </div>

          {/* 关闭按钮 */}
          <div className="absolute top-4 right-4 z-10">
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* 主图片区域 - 充分显示 */}
          <div className="relative flex items-center justify-center min-h-[60vh] p-8 group">
            <img
              src={currentResult.url}
              alt={`Result ${selectedResult + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              style={{
                maxWidth: "calc(100vw - 4rem)",
                maxHeight: "calc(100vh - 12rem)",
              }}
            />
            
            {/* 悬浮操作按钮 - 在图片底部，鼠标悬停时显示 */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex items-center gap-3 bg-black/60 dark:bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full"
                  onClick={() => onDownload?.()}
                >
                  <Download className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full"
                  onClick={handleEnhance}
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* 导航按钮 */}
          {results.length > 1 && (
            <>
              {/* 左侧导航 */}
              <Button
                variant="ghost"
                size="lg"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 h-12 w-12 p-0 rounded-full"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              {/* 右侧导航 */}
              <Button
                variant="ghost"
                size="lg"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 h-12 w-12 p-0 rounded-full"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* 底部缩略图导航 */}
          {results.length > 1 && (
            <div className="bg-black/70 dark:bg-black/80 backdrop-blur-sm p-4">
              <div className="flex justify-center">
                <div className="flex gap-2 max-w-full overflow-x-auto">
                  {results.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelect(idx)}
                      className={cn(
                        "flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-all duration-200",
                        selectedResult === idx
                          ? "border-green-500 shadow-lg shadow-green-500/50"
                          : "border-white/30 dark:border-gray-600 hover:border-white/60 dark:hover:border-gray-400"
                      )}
                    >
                      <img
                        src={result.url}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
