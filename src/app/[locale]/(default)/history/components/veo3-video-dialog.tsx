"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Veo3VideoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  video720pUrl: string | null;
  video1080pUrl: string | null;
  has1080p: boolean;
  prompt: string;
}

export default function Veo3VideoDialog({
  isOpen,
  onClose,
  video720pUrl,
  video1080pUrl,
  has1080p,
  prompt,
}: Veo3VideoDialogProps) {
  const t = useTranslations("history.veo3");
  const [quality, setQuality] = useState<"720p" | "1080p">("720p");

  const currentVideoUrl =
    quality === "1080p" && has1080p && video1080pUrl
      ? video1080pUrl
      : video720pUrl;

  const handleDownload = async () => {
    if (!currentVideoUrl) return;

    try {
      const response = await fetch(currentVideoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `veo3-video-${quality}.mp4`;
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
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 gap-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-green-200/50 dark:border-green-800/50 flex flex-col">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-green-200/30 dark:border-green-800/30">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full animate-pulse"></div>
              {t("video_preview")}
            </DialogTitle>

            {/* Quality selector */}
            {has1080p && video1080pUrl && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={quality === "720p" ? "default" : "outline"}
                  onClick={() => setQuality("720p")}
                  className={cn(
                    quality === "720p"
                      ? "bg-gradient-to-r from-green-600 to-cyan-600"
                      : ""
                  )}
                >
                  {t("720p")}
                </Button>
                <Button
                  size="sm"
                  variant={quality === "1080p" ? "default" : "outline"}
                  onClick={() => setQuality("1080p")}
                  className={cn(
                    quality === "1080p"
                      ? "bg-gradient-to-r from-green-600 to-cyan-600"
                      : ""
                  )}
                >
                  {t("1080p")}
                  <Sparkles className="ml-1 h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Main Content */}
        <div className="flex-1 flex flex-col p-6 gap-4 min-h-0">
          {/* Video Player */}
          <div className="flex-1 relative bg-black rounded-xl overflow-hidden shadow-2xl">
            {currentVideoUrl ? (
              <video
                key={currentVideoUrl}
                src={currentVideoUrl}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <p>Video not available</p>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl border border-green-200/30 dark:border-green-800/30 p-4 space-y-3">
            {/* Prompt */}
            <div>
              <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1">
                {t("prompt")}
              </h4>
              <p className="text-sm text-muted-foreground">{prompt}</p>
            </div>

            {/* Download Button */}
            <Button
              onClick={handleDownload}
              className="w-full bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700"
            >
              <Download className="mr-2 h-4 w-4" />
              {t("download_video")} ({quality})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
