"use client";

import { Sora2Task } from "../types";
import {
  EmptyState,
  ProcessingState,
  FailedState,
  CompletedState,
} from "./states";

// 通用任务类型,支持 Sora2Task 和 Wan25Task
type BaseTask = {
  id: string;
  status: "idle" | "uploading" | "processing" | "completed" | "failed";
  videoUrl: string | null;
  error?: string;
  [key: string]: any; // 允许其他额外字段
};

interface VideoOutputDisplayProps {
  task: Sora2Task | BaseTask | null;
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
    return <ProcessingState task={task as any} texts={processingStateTexts} />;
  }

  // Failed State
  if (task.status === "failed") {
    return <FailedState task={task as any} texts={failedStateTexts} />;
  }

  // Completed State
  if (task.status === "completed" && task.videoUrl) {
    return (
      <CompletedState
        task={task as any}
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
