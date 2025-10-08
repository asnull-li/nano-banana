"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Sparkles,
  ZoomIn,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export interface UpscalerTask {
  task_id: string;
  status: string;
  input: {
    original_image_url: string;
    scale: number;
    face_enhance: boolean;
  };
  upscaled_image_url: string | null;
  credits_used: number;
  credits_refunded: number;
  error_message: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

interface UpscalerHistoryCardProps {
  task: UpscalerTask;
  onViewComparison: () => void;
  onDelete: (taskId: string) => void;
}

export default function UpscalerHistoryCard({
  task,
  onViewComparison,
  onDelete,
}: UpscalerHistoryCardProps) {
  const t = useTranslations("history");

  // 获取状态配置
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          label: t("status.completed"),
          icon: CheckCircle,
          className: "bg-green-500/10 text-green-600 border-green-500/20",
        };
      case "failed":
        return {
          label: t("status.failed"),
          icon: AlertCircle,
          className: "bg-red-500/10 text-red-600 border-red-500/20",
        };
      case "processing":
        return {
          label: t("status.processing"),
          icon: Clock,
          className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
        };
      default:
        return {
          label: t("status.pending"),
          icon: Clock,
          className: "bg-gray-500/10 text-gray-600 border-gray-500/20",
        };
    }
  };

  const statusConfig = getStatusConfig(task.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border-green-500/10 hover:border-green-500/30">
      {/* 渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative p-4 space-y-4">
        {/* 状态标签和时间 */}
        <div className="flex items-center justify-between">
          <Badge className={cn("flex items-center gap-1", statusConfig.className)}>
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {task.created_at
              ? new Date(task.created_at).toLocaleString("default", {
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </span>
        </div>

        {/* 图片预览区域 */}
        <CardImagePreview task={task} onViewComparison={onViewComparison} />

        {/* 信息栏 */}
        <CardInfo task={task} />

        {/* 操作按钮 */}
        <CardActions
          task={task}
          onViewComparison={onViewComparison}
          onDelete={onDelete}
        />
      </div>
    </Card>
  );
}

// 图片预览子组件
function CardImagePreview({
  task,
  onViewComparison,
}: {
  task: UpscalerTask;
  onViewComparison: () => void;
}) {
  const t = useTranslations("history");

  if (task.status === "completed" && task.upscaled_image_url) {
    return (
      <div
        className="relative aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-green-500/10 to-cyan-500/10 cursor-pointer group/image"
        onClick={onViewComparison}
      >
        <img
          src={task.input.original_image_url}
          alt="Original"
          className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-110"
        />
        {/* Comparison overlay */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center mx-auto">
              <Eye className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-white text-sm font-medium">{t("view")}</p>
          </div>
        </div>
        {/* Scale badge */}
        <div className="absolute top-2 right-2 bg-green-600/90 text-white text-xs px-2 py-1 rounded font-semibold flex items-center gap-1">
          <ZoomIn className="h-3 w-3" />
          {task.input.scale}x
        </div>
      </div>
    );
  }

  if (task.status === "failed") {
    return (
      <div className="aspect-square rounded-lg bg-red-500/5 border border-red-500/20 flex flex-col items-center justify-center p-4 gap-2">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-xs text-red-600 text-center max-h-24 overflow-y-auto">
          {task.error_message || t("error.unknown")}
        </p>
        {task.credits_refunded > 0 && (
          <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-xs">
            {t("credits_refunded", { amount: task.credits_refunded })}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="aspect-square rounded-lg bg-gradient-to-br from-green-500/10 to-cyan-500/10 flex items-center justify-center">
      <div className="text-center space-y-2">
        <Loader2 className="h-8 w-8 text-green-500 animate-spin mx-auto" />
        <p className="text-xs text-muted-foreground">{t("status.processing")}</p>
      </div>
    </div>
  );
}

// 信息栏子组件
function CardInfo({ task }: { task: UpscalerTask }) {
  const t = useTranslations("history");
  const tUpscaler = useTranslations("history.upscaler");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{t("credits_used", { amount: task.credits_used })}</span>
        <span className="text-green-600 font-medium">{task.input.scale}x</span>
      </div>
      {task.input.face_enhance && (
        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
          <Sparkles className="h-3 w-3 mr-1" />
          {tUpscaler("face_enhance")}
        </Badge>
      )}
    </div>
  );
}

// 操作按钮子组件
function CardActions({
  task,
  onViewComparison,
  onDelete,
}: {
  task: UpscalerTask;
  onViewComparison: () => void;
  onDelete: (taskId: string) => void;
}) {
  const t = useTranslations("history");

  return (
    <div className="flex gap-2">
      {task.status === "completed" && task.upscaled_image_url && (
        <Button
          size="sm"
          variant="outline"
          className="flex-1 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10 hover:border-green-500/30"
          onClick={onViewComparison}
        >
          <Eye className="h-4 w-4 mr-1" />
          {t("view")}
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        className="hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-600"
        onClick={() => onDelete(task.task_id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
