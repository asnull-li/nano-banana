"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Maximize2,
  Share2,
  Copy,
  CheckCircle,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  Square,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { GenerationResult } from "../hooks/use-nano-banana";
import { useTranslations } from "next-intl";

interface ResultGalleryProps {
  results: GenerationResult[];
  mode: "text-to-image" | "image-to-image";
  aiDescription?: string;
  onReset?: () => void;
}

export default function ResultGallery({
  results,
  mode,
  aiDescription,
  onReset,
}: ResultGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "single">("grid");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const t = useTranslations("nano_banana.result_gallery");

  if (results.length === 0) {
    return null;
  }

  const selectedImage = results[selectedIndex];

  // 下载图片
  const handleDownload = async (url: string, index: number) => {
    setDownloadingIndex(index);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `nano-banana-${mode}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);

      toast.success(t("download_success"));
    } catch (error) {
      toast.error(t("download_failed"));
    } finally {
      setDownloadingIndex(null);
    }
  };

  // 复制图片链接
  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("link_copied"));
    } catch (error) {
      toast.error(t("copy_failed"));
    }
  };

  return (
    <div className="space-y-4">
      {/* 标题栏 */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-green-500/10 to-cyan-500/10">
              <Sparkles className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold">{t("title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("success_message", { count: results.length })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 视图切换 */}
            {results.length > 1 && (
              <div className="flex rounded-lg border border-green-500/20 p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 px-3",
                    viewMode === "grid" && "bg-green-500/10 text-green-600"
                  )}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid2X2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 px-3",
                    viewMode === "single" && "bg-green-500/10 text-green-600"
                  )}
                  onClick={() => setViewMode("single")}
                >
                  <Square className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* 重新生成按钮 */}
            {onReset && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="border-green-500/20 hover:border-green-500/40 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10"
              >
                {t("regenerate")}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* AI 描述 */}
      {aiDescription && (
        <Card className="p-4 bg-gradient-to-r from-green-500/5 to-cyan-500/5 border-green-500/20">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">{t("ai_reply")}</p>
              <p className="text-sm text-muted-foreground">{aiDescription}</p>
            </div>
          </div>
        </Card>
      )}

      {/* 网格视图 */}
      {viewMode === "grid" && (
        <div
          className={cn(
            "grid gap-4",
            "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
          )}
        >
          {results.map((result, index) => (
            <Card key={index} className="group overflow-hidden">
              <div className="relative h-64 bg-slate-100 dark:bg-slate-800">
                <img
                  src={result.url}
                  alt={`Generated ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* 悬停操作层 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/10 backdrop-blur-sm hover:bg-white/20"
                          onClick={() => {
                            setSelectedIndex(index);
                            setIsFullscreen(true);
                          }}
                        >
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/10 backdrop-blur-sm hover:bg-white/20"
                          onClick={() => handleCopyLink(result.url)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        className="bg-green-500/80 hover:bg-green-600/80 text-white backdrop-blur-sm"
                        onClick={() => handleDownload(result.url, index)}
                        disabled={downloadingIndex === index}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 索引标签 */}
                {results.length > 1 && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-black/50 text-white backdrop-blur-sm">
                      {index + 1}/{results.length}
                    </Badge>
                  </div>
                )}
              </div>

              {/* 图片信息 */}
              {(result.width || result.height) && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900">
                  <p className="text-xs text-muted-foreground">
                    {result.width} × {result.height}
                    {result.seed && ` • Seed: ${result.seed}`}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* 单图视图 */}
      {viewMode === "single" && results.length > 1 && (
        <Card className="overflow-hidden">
          <div className="relative">
            <div className="relative aspect-square bg-slate-100 dark:bg-slate-800">
              <img
                src={selectedImage.url}
                alt={`Generated ${selectedIndex + 1}`}
                className="w-full h-full object-contain"
              />

              {/* 导航按钮 */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/30 text-white backdrop-blur-sm"
                onClick={() => setSelectedIndex(Math.max(0, selectedIndex - 1))}
                disabled={selectedIndex === 0}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/30 text-white backdrop-blur-sm"
                onClick={() =>
                  setSelectedIndex(
                    Math.min(results.length - 1, selectedIndex + 1)
                  )
                }
                disabled={selectedIndex === results.length - 1}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              {/* 索引指示器 */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                {results.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      index === selectedIndex
                        ? "bg-white w-6"
                        : "bg-white/50 hover:bg-white/70"
                    )}
                    onClick={() => setSelectedIndex(index)}
                  />
                ))}
              </div>
            </div>

            {/* 操作栏 */}
            <div className="p-4 border-t bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {t("image_index", { current: selectedIndex + 1, total: results.length })}
                  {selectedImage.width &&
                    ` • ${selectedImage.width}×${selectedImage.height}`}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyLink(selectedImage.url)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    {t("copy_link")}
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white"
                    onClick={() =>
                      handleDownload(selectedImage.url, selectedIndex)
                    }
                    disabled={downloadingIndex === selectedIndex}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    {t("download_image")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 全屏预览 */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={selectedImage.url}
              alt="Fullscreen"
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* 关闭按钮 */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* 下载按钮 */}
            <Button
              className="absolute bottom-4 right-4 bg-green-500 hover:bg-green-600 text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(selectedImage.url, selectedIndex);
              }}
            >
              <Download className="h-5 w-5 mr-2" />
              {t("download_original")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
