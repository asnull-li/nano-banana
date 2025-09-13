import React from "react";

interface CreditsDisplayProps {
  creditsPerImage: number;
}

export default function CreditsDisplay({
  creditsPerImage,
}: CreditsDisplayProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-green-50 to-cyan-50 dark:from-green-950/20 dark:to-cyan-950/20 rounded-lg border border-green-200/50 dark:border-green-800/50">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          积分消耗
        </span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-lg font-bold text-green-600 dark:text-green-400">
          {creditsPerImage}
        </span>
        <span className="text-sm text-slate-500 dark:text-slate-400">积分</span>
      </div>
    </div>
  );
}
