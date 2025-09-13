import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, X } from "lucide-react";

interface ProgressStateProps {
  progress: number;
  elapsedTime?: number;
  taskId?: string;
  onCancel?: () => void;
}

export default function ProgressState({
  progress,
  elapsedTime = 0,
  taskId,
  onCancel,
}: ProgressStateProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      {/* 动画加载器 */}
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-ping">
          <div className="w-32 h-32 rounded-full opacity-20 bg-gradient-to-r from-green-500 to-cyan-500" />
        </div>
        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center shadow-2xl">
          <Loader2 className="h-16 w-16 text-white animate-spin" />
        </div>
      </div>

      <div className="space-y-4 max-w-md">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          AI 正在创作中...
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          请稍等片刻，精彩即将呈现
        </p>
      </div>

      {/* 进度条 */}
      <div className="w-full max-w-md mt-8 space-y-3">
        <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-cyan-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-200%] animate-shimmer" />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
          <span>{progress}%</span>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{elapsedTime}s</span>
          </div>
        </div>
      </div>

      {taskId && (
        <Badge variant="outline" className="mt-4 font-mono text-xs">
          任务 ID: {taskId}
        </Badge>
      )}

      {/* {onCancel && (
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="mt-6 hover:border-red-500 hover:text-red-500"
        >
          <X className="h-4 w-4 mr-2" />
          取消生成
        </Button>
      )} */}
    </div>
  );
}
