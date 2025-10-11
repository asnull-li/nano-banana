"use client";

import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sora2Task } from "../../types";

interface CompletedStateProps {
  task: Sora2Task;
  onDownload?: (videoUrl: string) => void;
  isDownloading?: boolean;
}

export default function CompletedState({
  task,
  onDownload,
  isDownloading = false,
}: CompletedStateProps) {
  if (!task.videoUrl) {
    return <div className="text-center py-8 text-slate-500">No video URL available</div>;
  }

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <div className="relative w-full aspect-video bg-slate-900 rounded-lg overflow-hidden">
        <video
          src={task.videoUrl}
          controls
          className="w-full h-full"
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Download Button */}
      <div className="flex gap-2">
        <Button
          onClick={() => onDownload?.(task.videoUrl!)}
          disabled={isDownloading}
          className="flex-1 text-black dark:text-white bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download Video
            </>
          )}
        </Button>
      </div>

      {/* Prompt Display */}
      {task.prompt && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            <span className="font-semibold">Prompt:</span> {task.prompt}
          </p>
        </div>
      )}
    </div>
  );
}
