"use client";

import { Sora2Task } from "../types";
import {
  EmptyState,
  ProcessingState,
  FailedState,
  CompletedState,
} from "./states";

interface VideoOutputDisplayProps {
  task: Sora2Task | null;
  onDownload?: (videoUrl: string) => void;
  isDownloading?: boolean;
  emptyStateTexts?: any;
  processingStateTexts?: any;
  failedStateTexts?: any;
  completedStateTexts?: any;
}

export default function VideoOutputDisplay({
  task,
  onDownload,
  isDownloading = false,
  emptyStateTexts,
  processingStateTexts,
  failedStateTexts,
  completedStateTexts,
}: VideoOutputDisplayProps) {
  // Empty State
  if (!task) {
    return <EmptyState texts={emptyStateTexts} />;
  }

  // Processing State
  if (task.status === "uploading" || task.status === "processing") {
    return <ProcessingState task={task} texts={processingStateTexts} />;
  }

  // Failed State
  if (task.status === "failed") {
    return <FailedState task={task} texts={failedStateTexts} />;
  }

  // Completed State
  if (task.status === "completed" && task.videoUrl) {
    return (
      <CompletedState
        task={task}
        onDownload={onDownload}
        isDownloading={isDownloading}
        texts={completedStateTexts}
      />
    );
  }

  // Fallback
  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-slate-400">No video data available</p>
    </div>
  );
}
