"use client";

import { Loader2, Clock, AlertCircle } from "lucide-react";
import { Sora2Task } from "../../types";

interface ProcessingStateProps {
  task: Sora2Task;
  texts?: any;
}

export default function ProcessingState({
  task,
  texts = {},
}: ProcessingStateProps) {
  const isPro = task.model === "sora2-pro";
  console.log(task);

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

      {/* Generation Time Notice - Only for Pro */}
      {isPro &&
        (task.status === "uploading" || task.status === "processing") && (
          <div className="mt-6 max-w-md mx-auto">
            <div className="p-4 rounded-lg bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {texts.generation_time_title || "⏱️ Generation Time"}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {texts.generation_time_desc ||
                        "10s HD typically takes 10-20 minutes, 15s HD takes ~30 minutes (reflects OpenAI's native delivery speed). We strongly recommend using the 15s HD option with caution as it requires longer time and may have slight imperfections."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                  <AlertCircle className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {texts.wait_notice ||
                      "You can leave this page or start a new generation task. Once completed, you can find your result in My Creations."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
