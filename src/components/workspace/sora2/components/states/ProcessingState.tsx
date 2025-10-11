"use client";

import { Loader2 } from "lucide-react";
import { Sora2Task } from "../../types";

interface ProcessingStateProps {
  task: Sora2Task;
  texts?: any;
}

export default function ProcessingState({
  task,
  texts = {},
}: ProcessingStateProps) {
  const statusText =
    task.status === "uploading"
      ? texts.uploading_title || "Uploading image..."
      : texts.generating_title || "Generating video...";

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-cyan-100 dark:from-emerald-900/20 dark:to-cyan-900/20 rounded-full flex items-center justify-center mb-4">
        <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
        {statusText}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-md">
        {texts.description ||
          "Please wait while we process your request. This may take a few minutes."}
      </p>
      {task.prompt && (
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg max-w-md">
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
            {task.prompt}
          </p>
        </div>
      )}
    </div>
  );
}
