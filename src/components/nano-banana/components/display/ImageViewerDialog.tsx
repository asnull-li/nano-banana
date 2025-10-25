import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Sparkles,
  Video,
  Film,
  Clapperboard,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("nano_banana.workspace.image_viewer");

  // 处理图片增强
  const handleEnhance = () => {
    if (!currentResult?.url) {
      toast.error(t("image_not_found"));
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
      toast.error(t("invalid_image_url"));
    }
  };

  // 处理图生视频
  const handleImageToVideo = (model: "veo3" | "sora2" | "wan25") => {
    if (!currentResult?.url) {
      toast.error(t("image_not_found"));
      return;
    }

    try {
      // 验证图片URL是否有效
      new URL(currentResult.url);

      // 将当前图片URL作为查询参数，跳转到对应页面
      const searchParams = new URLSearchParams();
      searchParams.set("imageUrl", currentResult.url);

      let targetPath = "/sora2"; // 默认值
      if (model === "veo3") {
        targetPath = "/veo3";
      } else if (model === "wan25") {
        targetPath = "/wan2-5";
      }

      router.push(`${targetPath}?${searchParams.toString()}`);
      onClose();
    } catch (error) {
      console.error("Invalid image URL:", error);
      toast.error(t("invalid_image_url"));
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
        className="max-w-[98vw] max-h-[98vh] w-full h-auto p-0 border-0 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden"
        onPointerDownOutside={onClose}
      >
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        <DialogDescription className="sr-only">
          {t("image_count", {
            current: selectedResult + 1,
            total: results.length,
          })}
        </DialogDescription>

        <div className="relative bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden flex flex-col">
          {/* 顶部计数器 */}
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-gray-900/80 dark:bg-gray-700/80 text-white text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm">
              {selectedResult + 1} / {results.length}
            </div>
          </div>
          {/* 主图片区域 - 充分显示 */}

          <div className="relative flex items-center justify-center p-4 group">
            <img
              src={currentResult.url}
              alt={`Result ${selectedResult + 1}`}
              className="w-auto h-auto max-w-[94vw] max-h-[90vh] object-contain rounded-lg shadow-lg"
            />

            {/* 悬浮操作按钮 - 在图片底部，鼠标悬停时显示 */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex items-center gap-3 bg-black/60 dark:bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full"
                  onClick={() => onDownload?.()}
                  title={t("download")}
                >
                  <Download className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full"
                  onClick={handleEnhance}
                  title={t("enhance")}
                >
                  <Sparkles className="h-4 w-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full"
                      title={t("image_to_video")}
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => handleImageToVideo("veo3")}
                    >
                      <Film className="h-4 w-4 mr-2" />
                      {t("use_veo3")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleImageToVideo("sora2")}
                    >
                      <Clapperboard className="h-4 w-4 mr-2" />
                      {t("use_sora2")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleImageToVideo("wan25")}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {t("use_wan25")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
