"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

// 导入模块化组件
import PageHeader from "./page-header";
import HistoryCard from "./history-card";
import EmptyState from "./empty-state";
import ImagePreviewDialog from "./image-preview-dialog";
import DeleteConfirmDialog from "./delete-confirm-dialog";
import LoadMoreButton from "./load-more-button";

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

interface HistoryClientProps {
  initialTasks: NanoBananaTask[];
  locale: string;
}

export default function HistoryClient({
  initialTasks,
  locale,
}: HistoryClientProps) {
  const t = useTranslations("history");
  const [tasks, setTasks] = useState<NanoBananaTask[]>(initialTasks);
  const [selectedImages, setSelectedImages] = useState<string[] | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTasks.length === 20);
  const [page, setPage] = useState(1);

  // 下载图片
  const handleDownload = async (
    url: string,
    taskId?: string,
    index?: number
  ) => {
    try {
      // 通过 fetch 获取图片数据
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch image");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      // 创建下载链接
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = taskId
        ? `nano-banana-${taskId}-${(index || 0) + 1}.png`
        : `nano-banana-image.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 清理对象 URL
      URL.revokeObjectURL(objectUrl);

      toast.success(t("download_success"));
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(t("download_error") || "Failed to download image");
    }
  };

  // 删除任务
  const handleDelete = async () => {
    if (!deleteTaskId) return;

    try {
      const response = await fetch(`/api/nano-banana/history/${deleteTaskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      setTasks(tasks.filter((task) => task.task_id !== deleteTaskId));
      toast.success(t("delete_success"));
    } catch (error) {
      toast.error(t("delete_error"));
    } finally {
      setDeleteTaskId(null);
    }
  };

  // 加载更多
  const loadMore = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/nano-banana/history?page=${page + 1}&limit=20`
      );
      const data = await response.json();

      if (data.success && data.tasks) {
        setTasks([...tasks, ...data.tasks]);
        setPage(page + 1);
        setHasMore(data.tasks.length === 20);
      }
    } catch (error) {
      toast.error(t("load_more_error"));
    } finally {
      setIsLoading(false);
    }
  };

  // 处理图片预览对话框的下载
  const handlePreviewDownload = async (url: string) => {
    const task = tasks.find((t) => {
      const result = parseResult(t.result);
      return result?.images?.some((img: any) => img.url === url);
    });
    if (task) {
      const result = parseResult(task.result);
      const imageIndex =
        result?.images?.findIndex((img: any) => img.url === url) || 0;
      await handleDownload(url, task.task_id, imageIndex);
    } else {
      await handleDownload(url);
    }
  };

  // 处理图片点击
  const handleImageClick = (task: NanoBananaTask) => {
    const result = parseResult(task.result);
    if (result?.images && result.images.length > 0) {
      const imageUrls = result.images.map((img: any) => img.url);
      setSelectedImages(imageUrls);
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

  // 空状态
  if (tasks.length === 0) {
    return <EmptyState locale={locale} />;
  }

  return (
    <div className="container py-10">
      {/* 页面标题 */}
      <PageHeader />

      {/* 任务网格 */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tasks.map((task) => (
          <HistoryCard
            key={task.task_id}
            task={task}
            onViewImage={() => handleImageClick(task)}
            onDownload={handleDownload}
            onDelete={setDeleteTaskId}
          />
        ))}
      </div>

      {/* 加载更多按钮 */}
      <LoadMoreButton
        isLoading={isLoading}
        hasMore={hasMore}
        tasksCount={tasks.length}
        onLoadMore={loadMore}
      />

      {/* 图片查看对话框 */}
      <ImagePreviewDialog
        images={selectedImages}
        onClose={() => setSelectedImages(null)}
        onDownload={handlePreviewDownload}
      />

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        isOpen={!!deleteTaskId}
        onClose={() => setDeleteTaskId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
