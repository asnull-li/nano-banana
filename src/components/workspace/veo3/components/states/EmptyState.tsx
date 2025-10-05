"use client";

import { Film, Sparkles } from "lucide-react";

interface EmptyStateProps {
  texts?: any;
}

export default function EmptyState({ texts = {} }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-cyan-100 dark:from-emerald-900/30 dark:to-cyan-900/30 flex items-center justify-center mx-auto">
          <Film className="w-10 h-10 text-emerald-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
            {texts.title || "No Video Yet"}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            {texts.description || "Enter a prompt and click generate to create your first video with Veo3"}
          </p>
        </div>
        <div className="flex items-center gap-2 justify-center pt-2">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {texts.modes || "Text-to-video or Image-to-video generation"}
          </span>
        </div>
      </div>
    </div>
  );
}
