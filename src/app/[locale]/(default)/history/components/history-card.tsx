"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Sparkles,
  ImageIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface NanoBananaTask {
  id: number;
  task_id: string;
  request_id: string;
  user_uuid: string;
  type: string;
  provider: string;
  prompt: string;
  image_urls: string | null;
  num_images: number;
  status: string;
  result: string | null;
  credits_used: number;
  credits_refunded: number;
  error_message: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

interface HistoryCardProps {
  task: NanoBananaTask;
  onViewImage: () => void;
  onDownload: (url: string, taskId: string, index: number) => Promise<void>;
  onDelete: (taskId: string) => void;
}

export default function HistoryCard({
  task,
  onViewImage,
  onDownload,
  onDelete,
}: HistoryCardProps) {
  const t = useTranslations("history");

  // 根据当前域名转换图片 URL
  const transformImageUrl = (url: string) => {
    if (typeof window !== "undefined" && window.location.hostname === "nanobananaorg.org") {
      return url.replace("file.nanobanana.org", "file.nanobananaorg.org");
    }
    return url;
  };

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

  // 解析结果
  const parseResult = (result: string | null) => {
    if (!result) return null;
    try {
      return JSON.parse(result);
    } catch {
      return null;
    }
  };

  const statusConfig = getStatusConfig(task.status);
  const StatusIcon = statusConfig.icon;
  const result = parseResult(task.result);
  const images = result?.images || [];

  // 转换图片 URLs
  const transformedImages = images.map((img: any) => ({
    ...img,
    url: transformImageUrl(img.url),
  }));

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
                  minute: "2-digit" 
                })
              : ""}
          </span>
        </div>

        {/* 图片预览区域 */}
        <CardImagePreview
          task={task}
          images={transformedImages}
          onViewImage={onViewImage}
        />

        {/* 提示词 */}
        <p className="text-sm text-muted-foreground line-clamp-2">{task.prompt}</p>

        {/* 信息栏 */}
        <CardInfo task={task} />

        {/* 操作按钮 */}
        <CardActions
          task={task}
          images={transformedImages}
          onViewImage={onViewImage}
          onDownload={onDownload}
          onDelete={onDelete}
        />
      </div>
    </Card>
  );
}

// 图片预览子组件
function CardImagePreview({
  task,
  images,
  onViewImage,
}: {
  task: NanoBananaTask;
  images: any[];
  onViewImage: () => void;
}) {
  const t = useTranslations("history");

  if (task.status === "completed" && images.length > 0) {
    return (
      <div className="relative aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-green-500/10 to-cyan-500/10">
        <img
          src={images[0].url}
          alt={task.prompt}
          className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-110"
          onClick={onViewImage}
        />
        {images.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            +{images.length - 1}
          </div>
        )}
      </div>
    );
  }

  if (task.status === "failed") {
    return (
      <div className="aspect-square rounded-lg bg-red-500/5 border border-red-500/20 flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
        <p className="text-xs text-red-600 text-center line-clamp-3">
          {task.error_message || t("error.unknown")}
        </p>
        {task.credits_refunded > 0 && (
          <Badge className="mt-2 bg-orange-500/10 text-orange-600 border-orange-500/20">
            {t("credits_refunded", { amount: task.credits_refunded })}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="aspect-square rounded-lg bg-gradient-to-br from-green-500/10 to-cyan-500/10 flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
    </div>
  );
}

// 信息栏子组件
function CardInfo({ task }: { task: NanoBananaTask }) {
  const t = useTranslations("history");

  return (
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <span>{t("credits_used", { amount: task.credits_used })}</span>
      <span>
        {task.type === "text-to-image" ? (
          <Sparkles className="inline h-3 w-3 mr-1" />
        ) : (
          <ImageIcon className="inline h-3 w-3 mr-1" />
        )}
        {task.num_images} {t("images")}
      </span>
    </div>
  );
}

// 操作按钮子组件
function CardActions({
  task,
  images,
  onViewImage,
  onDownload,
  onDelete,
}: {
  task: NanoBananaTask;
  images: any[];
  onViewImage: () => void;
  onDownload: (url: string, taskId: string, index: number) => Promise<void>;
  onDelete: (taskId: string) => void;
}) {
  const t = useTranslations("history");

  return (
    <div className="flex gap-2">
      {task.status === "completed" && images.length > 0 && (
        <>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10 hover:border-green-500/30"
            onClick={onViewImage}
          >
            <Eye className="h-4 w-4 mr-1" />
            {t("view")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10 hover:border-green-500/30"
            onClick={() => onDownload(images[0].url, task.task_id, 0)}
          >
            <Download className="h-4 w-4 mr-1" />
            {t("download")}
          </Button>
        </>
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