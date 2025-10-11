"use client";

import { AlertCircle } from "lucide-react";
import { Sora2Task } from "../../types";

interface FailedStateProps {
  task: Sora2Task;
}

export default function FailedState({ task }: FailedStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
        Generation Failed
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-md mb-4">
        {task.error || "An error occurred during video generation"}
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500">
        Your credits have been refunded
      </p>
    </div>
  );
}
