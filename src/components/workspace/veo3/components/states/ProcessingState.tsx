"use client";

import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Veo3Task } from "../../types";

interface ProcessingStateProps {
  task: Veo3Task;
  texts?: any;
}

export default function ProcessingState({ task, texts = {} }: ProcessingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto animate-pulse">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          {/* Animated Ring */}
          <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-4 border-emerald-300 dark:border-emerald-700 animate-ping opacity-75"></div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
            {task.status === "uploading"
              ? (texts.uploading_title || "Uploading...")
              : (texts.generating_title || "Generating Video...")}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
            {task.status === "uploading"
              ? (texts.uploading_description || "Uploading your image to the server...")
              : (texts.generating_description || "Your video is being generated. This may take a few minutes...")}
          </p>
          <Badge
            variant="secondary"
            className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 mt-3"
          >
            Model: {task.model === "veo3" ? (texts.model_quality || "Quality Mode") : (texts.model_fast || "Fast Mode")}
          </Badge>
        </div>

        {/* Prompt Display */}
        <div className="max-w-lg bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{texts.prompt_label || "Prompt:"}</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">
            {task.prompt}
          </p>
        </div>

        <p className="text-xs text-slate-400">
          {texts.dont_close || "Please don't close this page while generating..."}
        </p>
      </div>
    </div>
  );
}
