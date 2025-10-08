"use client";

import { Download, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Veo3Task } from "../../types";
import VideoPlayer from "../video-player";

interface CompletedStateProps {
  task: Veo3Task;
  onUpgrade1080p?: () => void;
  onDownload?: (videoUrl: string, quality: "720p" | "1080p") => void;
  isUpgrading?: boolean;
  downloadingQuality?: "720p" | "1080p" | null;
  texts?: any;
}

export default function CompletedState({
  task,
  onUpgrade1080p,
  onDownload,
  isUpgrading = false,
  downloadingQuality = null,
  texts = {},
}: CompletedStateProps) {
  if (!task.video720pUrl) return null;

  return (
    <div className="space-y-4">
      {/* Videos */}
      {task.has1080p && task.video1080pUrl ? (
        <div className="space-y-3">
          {/* 720p Video */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {texts.quality_720p || "720p"}
              </Badge>
              {onDownload && (
                <Button
                  onClick={() => onDownload(task.video720pUrl!, "720p")}
                  disabled={downloadingQuality === "720p"}
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                >
                  {downloadingQuality === "720p" ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      {texts.downloading || "Downloading..."}
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3 mr-1" />
                      {texts.download || "Download"}
                    </>
                  )}
                </Button>
              )}
            </div>
            <VideoPlayer
              videoUrl={task.video720pUrl}
              quality="720p"
              className="w-full aspect-video"
            />
          </div>

          {/* 1080p Video */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge
                variant="secondary"
                className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              >
                {texts.quality_1080p || "1080p HD"}
              </Badge>
              {onDownload && (
                <Button
                  onClick={() => onDownload(task.video1080pUrl!, "1080p")}
                  disabled={downloadingQuality === "1080p"}
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                >
                  {downloadingQuality === "1080p" ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      {texts.downloading || "Downloading..."}
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3 mr-1" />
                      {texts.download || "Download"}
                    </>
                  )}
                </Button>
              )}
            </div>
            <VideoPlayer
              videoUrl={task.video1080pUrl}
              quality="1080p"
              className="w-full aspect-video"
            />
          </div>
        </div>
      ) : (
        /* Only 720p */
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {texts.quality_720p || "720p"}
            </Badge>
            {onDownload && task.video720pUrl && (
              <Button
                onClick={() => onDownload(task.video720pUrl!, "720p")}
                disabled={downloadingQuality === "720p"}
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
              >
                {downloadingQuality === "720p" ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    {texts.downloading || "Downloading..."}
                  </>
                ) : (
                  <>
                    <Download className="w-3 h-3 mr-1" />
                    {texts.download || "Download"}
                  </>
                )}
              </Button>
            )}
          </div>
          <VideoPlayer
            videoUrl={task.video720pUrl}
            quality="720p"
            className="w-full aspect-video"
          />
        </div>
      )}

      {/* 1080p Processing Status */}
      {isUpgrading && task.canUpgradeTo1080p && !task.has1080p && (
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Loader2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-spin" />
              <div className="absolute inset-0 w-5 h-5 rounded-full border-2 border-emerald-300/50 dark:border-emerald-700/50 animate-ping"></div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                {texts.preparing_1080p || "Preparing 1080P HD Version"}
              </p>
              <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
                {texts.preparing_1080p_hint ||
                  "This may take 1-2 minutes. The video will appear automatically when ready..."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Video Info & Actions */}
      <div className="flex items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            >
              {texts.completed || "Completed"}
            </Badge>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {task.aspectRatio} •{" "}
              {task.model === "veo3"
                ? texts.mode_quality || "Quality"
                : texts.mode_fast || "Fast"}{" "}
              Mode
            </span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
            {task.prompt}
          </p>
        </div>

        {/* 1080P Upgrade Button */}
        {task.canUpgradeTo1080p && !task.has1080p && (
          <Button
            onClick={onUpgrade1080p}
            disabled={isUpgrading}
            size="sm"
            className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700"
          >
            {isUpgrading ? (
              <>
                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                {texts.upgrading || "Upgrading..."}
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 mr-1.5" />
                {texts.upgrade_button?.replace("${credits}", "10") ||
                  "Upgrade to 1080p (10 credits)"}
              </>
            )}
          </Button>
        )}
      </div>

      {/* Input Image Display */}
      {task.inputImage && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
            {texts.input_image_label || "Input Image:"}
          </p>
          <img
            src={task.inputImage}
            alt="Input"
            className="w-32 h-32 object-cover rounded border border-slate-300 dark:border-slate-600"
          />
        </div>
      )}
    </div>
  );
}
