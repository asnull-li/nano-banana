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
  Film,
  Image as ImageIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export interface Wan25Task {
  task_id: string;
  status: string;
  type: string;
  input: {
    prompt: string;
    duration: string;
    resolution: string;
    aspect_ratio?: string;
    image_url?: string;
    negative_prompt?: string;
    enable_prompt_expansion?: boolean;
    seed?: number;
  };
  video_url: string | null;
  credits_used: number;
  credits_refunded: number;
  error_message: string | null;
  created_at: Date | null;
  completed_at: Date | null;
}

interface Wan25HistoryCardProps {
  task: Wan25Task;
  onViewVideo: () => void;
  onDelete: (taskId: string) => void;
}

export default function Wan25HistoryCard({
  task,
  onViewVideo,
  onDelete,
}: Wan25HistoryCardProps) {
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
          <Badge
            className={cn("flex items-center gap-1", statusConfig.className)}
          >
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

        {/* 视频预览区域 */}
        <CardVideoPreview task={task} onViewVideo={onViewVideo} />

        {/* 提示词 */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {task.input.prompt}
        </p>

        {/* 信息栏 */}
        <CardInfo task={task} />

        {/* 操作按钮 */}
        <CardActions
          task={task}
          onViewVideo={onViewVideo}
          onDelete={onDelete}
        />
      </div>
    </Card>
  );
}

// 视频预览子组件
function CardVideoPreview({
  task,
  onViewVideo,
}: {
  task: Wan25Task;
  onViewVideo: () => void;
}) {
  const t = useTranslations("history");

  if (task.status === "completed" && task.video_url) {
    return (
      <div
        className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-green-500/10 to-cyan-500/10 cursor-pointer group/video"
        onClick={onViewVideo}
      >
        <video
          src={task.video_url}
          className="w-full h-full object-cover"
          muted
          playsInline
        />
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
            <Film className="h-8 w-8 text-green-600" />
          </div>
        </div>
        {/* Model badge */}
        <div className="absolute top-2 right-2 bg-green-600/90 text-white text-xs px-2 py-1 rounded font-semibold uppercase">
          WAN 2.5
        </div>
        {/* I2V badge */}
        {task.input.image_url && (
          <div className="absolute top-2 left-2 bg-cyan-600/90 text-white text-xs px-2 py-1 rounded font-semibold flex items-center gap-1">
            <ImageIcon className="h-3 w-3" />
            I2V
          </div>
        )}
        {/* Duration badge */}
        {task.input.duration && (
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {task.input.duration}s
          </div>
        )}
        {/* Resolution badge */}
        {task.input.resolution && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {task.input.resolution}
          </div>
        )}
      </div>
    );
  }

  if (task.status === "failed") {
    return (
      <div className="aspect-video rounded-lg bg-red-500/5 border border-red-500/20 flex flex-col items-center justify-center p-4 gap-2">
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
    <div className="aspect-video rounded-lg bg-gradient-to-br from-green-500/10 to-cyan-500/10 flex items-center justify-center">
      <div className="text-center space-y-2">
        <Loader2 className="h-8 w-8 text-green-500 animate-spin mx-auto" />
        <p className="text-xs text-muted-foreground">
          {t("status.processing")}
        </p>
      </div>
    </div>
  );
}

// 信息栏子组件
function CardInfo({ task }: { task: Wan25Task }) {
  const t = useTranslations("history");

  return (
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <span>{t("credits_used", { amount: task.credits_used })}</span>
    </div>
  );
}

// 操作按钮子组件
function CardActions({
  task,
  onViewVideo,
  onDelete,
}: {
  task: Wan25Task;
  onViewVideo: () => void;
  onDelete: (taskId: string) => void;
}) {
  const t = useTranslations("history");

  return (
    <div className="flex gap-2">
      {task.status === "completed" && task.video_url && (
        <Button
          size="sm"
          variant="outline"
          className="flex-1 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10 hover:border-green-500/30"
          onClick={onViewVideo}
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
