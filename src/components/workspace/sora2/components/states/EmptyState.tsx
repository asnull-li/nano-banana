"use client";

import { Film } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-cyan-100 dark:from-emerald-900/20 dark:to-cyan-900/20 rounded-full flex items-center justify-center mb-4">
        <Film className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
        Ready to Generate
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-md">
        Enter your prompt and click generate to create amazing videos with Sora 2
      </p>
    </div>
  );
}
