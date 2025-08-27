"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Upload,
  Cpu,
  Download,
  Clock,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "../hooks/use-nano-banana";
import { useTranslations } from "next-intl";

interface GenerationStatusProps {
  status: TaskStatus;
  progress: number;
  taskId: string | null;
  onCancel?: () => void;
}

const getStatusConfig = (t: any) => ({
  idle: {
    icon: Clock,
    labelKey: "ready",
    descKey: "ready_desc",
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    animate: false,
  },
  uploading: {
    icon: Upload,
    labelKey: "uploading",
    descKey: "uploading_desc",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    animate: true,
  },
  processing: {
    icon: Cpu,
    labelKey: "processing",
    descKey: "processing_desc",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    animate: true,
  },
  fetching: {
    icon: Download,
    labelKey: "fetching",
    descKey: "fetching_desc",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    animate: true,
  },
  completed: {
    icon: CheckCircle,
    labelKey: "completed",
    descKey: "completed_desc",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    animate: false,
  },
  failed: {
    icon: XCircle,
    labelKey: "failed",
    descKey: "failed_desc",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    animate: false,
  },
});

export default function GenerationStatus({
  status,
  progress,
  taskId,
  onCancel,
}: GenerationStatusProps) {
  const t = useTranslations("nano_banana.generation_status");
  const statusConfig = getStatusConfig(t);
  const config = statusConfig[status];
  const Icon = config.icon;
  const isProcessing = ["uploading", "processing", "fetching"].includes(status);

  // 估算剩余时间（简单估算）
  const estimateTime = () => {
    if (!isProcessing || progress === 0) return null;
    
    if (status === "uploading") {
      const remaining = Math.ceil((100 - progress) / 10);
      return t("estimate_time", { time: remaining });
    }
    
    if (status === "processing") {
      const remaining = Math.ceil((100 - progress) / 2);
      return t("estimate_time", { time: remaining });
    }
    
    return t("estimate_time", { time: "1" });
  };

  if (status === "idle") {
    return null;
  }

  return (
    <Card className={cn(
      "p-4 transition-all duration-500",
      config.animate && "animate-pulse-border",
      "border-2",
      status === "completed" && "border-green-500/50",
      status === "failed" && "border-red-500/50",
      isProcessing && "border-green-500/30"
    )}>
      <div className="space-y-3">
        {/* 状态头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg transition-colors",
              config.bgColor
            )}>
              <Icon className={cn(
                "h-5 w-5",
                config.color,
                config.animate && "animate-spin"
              )} />
            </div>
            <div>
              <p className="font-medium">{t(config.labelKey)}</p>
              <p className="text-sm text-muted-foreground">
                {t(config.descKey)}
              </p>
            </div>
          </div>
          
          {/* 取消按钮 */}
          {isProcessing && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
            >
              <X className="h-4 w-4 mr-1" />
              {t("cancel")}
            </Button>
          )}
        </div>

        {/* 进度条 */}
        {(isProcessing || status === "completed") && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("progress")}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{Math.round(progress)}%</span>
                {estimateTime() && (
                  <span className="text-xs text-muted-foreground">
                    ({estimateTime()})
                  </span>
                )}
              </div>
            </div>
            <Progress 
              value={progress} 
              className={cn(
                "h-2 transition-all",
                status === "completed" && "[&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-cyan-500"
              )}
            />
          </div>
        )}

        {/* 任务ID */}
        {taskId && isProcessing && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              {t("task_id", { taskId })}
            </p>
          </div>
        )}

        {/* 处理中的动画提示 */}
        {status === "processing" && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="animate-pulse">
              {t("ai_working")}
            </span>
          </div>
        )}
      </div>

      {/* 自定义动画样式 */}
      <style jsx>{`
        @keyframes pulse-border {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
          }
        }
        
        .animate-pulse-border {
          animation: pulse-border 2s infinite;
        }
      `}</style>
    </Card>
  );
}