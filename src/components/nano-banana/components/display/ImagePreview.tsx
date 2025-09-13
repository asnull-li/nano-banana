import React from "react";
import { Button } from "@/components/ui/button";
import { Maximize2, Download, Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface ImagePreviewProps {
  imageUrl: string;
  onDownload?: () => void;
  onShare?: () => void;
  isShared?: boolean;
  onImageClick?: () => void;
}

export default function ImagePreview({
  imageUrl,
  onDownload,
  onShare,
  isShared = false,
  onImageClick,
}: ImagePreviewProps) {
  const t = useTranslations("nano_banana.workspace.image_preview");

  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
      return;
    }

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nano-banana-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(t("download_success"));
    } catch (error) {
      toast.error(t("download_failed"));
    }
  };

  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }

    try {
      await navigator.clipboard.writeText(imageUrl);
      toast.success(t("link_copied"));
    } catch (error) {
      toast.error(t("copy_failed"));
    }
  };

  return (
    <div className="relative h-full rounded-lg overflow-hidden group">
      <img
        src={imageUrl}
        alt="Generated"
        className="w-full h-full object-contain cursor-pointer transition-transform duration-200 hover:scale-105"
        onClick={onImageClick}
      />

      {/* 悬浮操作按钮 */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity space-y-2 space-x-1">
        <Button
          size="sm"
          variant="secondary"
          className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            onImageClick?.();
          }}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            handleShare();
          }}
        >
          {isShared ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Share2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* 点击提示 */}
      {onImageClick && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
            {t("click_to_view")}
          </div>
        </div>
      )}
    </div>
  );
}
