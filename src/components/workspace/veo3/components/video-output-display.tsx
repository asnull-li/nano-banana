"use client";

import { Veo3Task } from "../types";
import EmptyState from "./states/EmptyState";
import ProcessingState from "./states/ProcessingState";
import FailedState from "./states/FailedState";
import CompletedState from "./states/CompletedState";

interface VideoOutputDisplayProps {
  task: Veo3Task | null;
  onUpgrade1080p?: () => void;
  onDownload?: (videoUrl: string, quality: "720p" | "1080p") => void;
  isUpgrading?: boolean;
  downloadingQuality?: "720p" | "1080p" | null;
  className?: string;
  emptyStateTexts?: any;
  processingStateTexts?: any;
  failedStateTexts?: any;
  completedStateTexts?: any;
}

export default function VideoOutputDisplay({
  task,
  onUpgrade1080p,
  onDownload,
  isUpgrading = false,
  downloadingQuality = null,
  className,
  emptyStateTexts,
  processingStateTexts,
  failedStateTexts,
  completedStateTexts,
}: VideoOutputDisplayProps) {
  // Empty State
  if (!task) {
    return (
      <div className={className}>
        <EmptyState texts={emptyStateTexts} />
      </div>
    );
  }

  // Processing State
  if (task.status === "uploading" || task.status === "processing") {
    return (
      <div className={className}>
        <ProcessingState task={task} texts={processingStateTexts} />
      </div>
    );
  }

  // Failed State
  if (task.status === "failed") {
    return (
      <div className={className}>
        <FailedState task={task} texts={failedStateTexts} />
      </div>
    );
  }

  // Completed State
  if (task.status === "completed" && task.video720pUrl) {
    return (
      <div className={className}>
        <CompletedState
          task={task}
          onUpgrade1080p={onUpgrade1080p}
          onDownload={onDownload}
          isUpgrading={isUpgrading}
          downloadingQuality={downloadingQuality}
          texts={completedStateTexts}
        />
      </div>
    );
  }

  // Fallback for unexpected state
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <p className="text-slate-400">No video data available</p>
    </div>
  );
}
