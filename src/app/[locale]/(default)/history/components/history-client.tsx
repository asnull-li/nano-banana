"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

// 导入组件
import HistoryTabs, { HistoryTabType } from "./history-tabs";
import PageHeader from "./page-header";
import HistoryCard from "./history-card";
import Veo3HistoryCard, { Veo3Task } from "./veo3-history-card";
import UpscalerHistoryCard, { UpscalerTask } from "./upscaler-history-card";
import EmptyState from "./empty-state";
import ImagePreviewDialog from "./image-preview-dialog";
import Veo3VideoDialog from "./veo3-video-dialog";
import UpscalerCompareDialog from "./upscaler-compare-dialog";
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

interface TabData<T> {
  tasks: T[];
  isLoaded: boolean;
  isLoading: boolean;
  hasMore: boolean;
  page: number;
}

export default function HistoryClient({
  initialTasks,
  locale,
}: HistoryClientProps) {
  const t = useTranslations("history");

  // Tab 状态
  const [activeTab, setActiveTab] = useState<HistoryTabType>("nano-banana");

  // 三种类型的数据状态
  const [nanoBananaData, setNanoBananaData] = useState<
    TabData<NanoBananaTask>
  >({
    tasks: initialTasks,
    isLoaded: true,
    isLoading: false,
    hasMore: initialTasks.length === 20,
    page: 1,
  });

  const [veo3Data, setVeo3Data] = useState<TabData<Veo3Task>>({
    tasks: [],
    isLoaded: false,
    isLoading: false,
    hasMore: false,
    page: 0,
  });

  const [upscalerData, setUpscalerData] = useState<TabData<UpscalerTask>>({
    tasks: [],
    isLoaded: false,
    isLoading: false,
    hasMore: false,
    page: 0,
  });

  // Dialog 状态
  const [selectedImages, setSelectedImages] = useState<string[] | null>(null);
  const [selectedVeo3Video, setSelectedVeo3Video] = useState<Veo3Task | null>(
    null
  );
  const [selectedUpscalerTask, setSelectedUpscalerTask] =
    useState<UpscalerTask | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [deleteTabType, setDeleteTabType] = useState<HistoryTabType | null>(
    null
  );

  // Tab 切换时懒加载数据
  useEffect(() => {
    if (activeTab === "veo3" && !veo3Data.isLoaded && !veo3Data.isLoading) {
      loadVeo3Data();
    }
    if (
      activeTab === "upscaler" &&
      !upscalerData.isLoaded &&
      !upscalerData.isLoading
    ) {
      loadUpscalerData();
    }
  }, [activeTab]);

  // 加载 Veo3 数据
  const loadVeo3Data = async () => {
    setVeo3Data((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch("/api/veo3/history?limit=20");
      const data = await response.json();

      if (data.success && data.tasks) {
        setVeo3Data({
          tasks: data.tasks,
          isLoaded: true,
          isLoading: false,
          hasMore: data.tasks.length === 20,
          page: 1,
        });
      }
    } catch (error) {
      toast.error(t("load_more_error"));
      setVeo3Data((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // 加载 Upscaler 数据
  const loadUpscalerData = async () => {
    setUpscalerData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch("/api/upscaler/history?limit=20");
      const data = await response.json();

      if (data.success && data.tasks) {
        setUpscalerData({
          tasks: data.tasks,
          isLoaded: true,
          isLoading: false,
          hasMore: data.tasks.length === 20,
          page: 1,
        });
      }
    } catch (error) {
      toast.error(t("load_more_error"));
      setUpscalerData((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // 根据当前域名转换图片 URL
  const transformImageUrl = (url: string) => {
    if (
      typeof window !== "undefined" &&
      window.location.hostname === "nanobananaorg.org"
    ) {
      return url.replace("file.nanobanana.org", "file.nanobananaorg.org");
    }
    return url;
  };

  // 下载图片 (Nano Banana)
  const handleDownload = async (
    url: string,
    taskId?: string,
    index?: number
  ) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch image");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = taskId
        ? `nano-banana-${taskId}-${(index || 0) + 1}.png`
        : `nano-banana-image.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(objectUrl);
      toast.success(t("download_success"));
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(t("download_error") || "Failed to download image");
    }
  };

  // 删除任务
  const handleDelete = async () => {
    if (!deleteTaskId || !deleteTabType) return;

    try {
      let apiPath = "";
      if (deleteTabType === "nano-banana") {
        apiPath = `/api/nano-banana/history/${deleteTaskId}`;
      } else if (deleteTabType === "veo3") {
        apiPath = `/api/veo3/history/${deleteTaskId}`;
      } else if (deleteTabType === "upscaler") {
        apiPath = `/api/upscaler/history/${deleteTaskId}`;
      }

      const response = await fetch(apiPath, { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      // 更新对应的数据状态
      if (deleteTabType === "nano-banana") {
        setNanoBananaData((prev) => ({
          ...prev,
          tasks: prev.tasks.filter((task) => task.task_id !== deleteTaskId),
        }));
      } else if (deleteTabType === "veo3") {
        setVeo3Data((prev) => ({
          ...prev,
          tasks: prev.tasks.filter((task) => task.task_id !== deleteTaskId),
        }));
      } else if (deleteTabType === "upscaler") {
        setUpscalerData((prev) => ({
          ...prev,
          tasks: prev.tasks.filter((task) => task.task_id !== deleteTaskId),
        }));
      }

      toast.success(t("delete_success"));
    } catch (error) {
      toast.error(t("delete_error"));
    } finally {
      setDeleteTaskId(null);
      setDeleteTabType(null);
    }
  };

  // 加载更多 (Nano Banana)
  const loadMoreNanoBanana = async () => {
    setNanoBananaData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch(
        `/api/nano-banana/history?page=${nanoBananaData.page + 1}&limit=20`
      );
      const data = await response.json();

      if (data.success && data.tasks) {
        setNanoBananaData((prev) => ({
          ...prev,
          tasks: [...prev.tasks, ...data.tasks],
          page: prev.page + 1,
          hasMore: data.tasks.length === 20,
          isLoading: false,
        }));
      }
    } catch (error) {
      toast.error(t("load_more_error"));
      setNanoBananaData((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // 处理 Nano Banana 图片预览
  const handleNanoBananaImageClick = (task: NanoBananaTask) => {
    const result = parseResult(task.result);
    if (result?.images && result.images.length > 0) {
      const imageUrls = result.images.map((img: any) =>
        transformImageUrl(img.url)
      );
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

  // 处理图片预览对话框的下载
  const handlePreviewDownload = async (url: string) => {
    const task = nanoBananaData.tasks.find((t) => {
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

  // 渲染内容
  const renderContent = () => {
    if (activeTab === "nano-banana") {
      if (nanoBananaData.tasks.length === 0) {
        return <EmptyState locale={locale} />;
      }

      return (
        <>
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {nanoBananaData.tasks.map((task) => (
              <HistoryCard
                key={task.task_id}
                task={task}
                onViewImage={() => handleNanoBananaImageClick(task)}
                onDownload={handleDownload}
                onDelete={(taskId) => {
                  setDeleteTaskId(taskId);
                  setDeleteTabType("nano-banana");
                }}
              />
            ))}
          </div>

          <LoadMoreButton
            isLoading={nanoBananaData.isLoading}
            hasMore={nanoBananaData.hasMore}
            tasksCount={nanoBananaData.tasks.length}
            onLoadMore={loadMoreNanoBanana}
          />
        </>
      );
    }

    if (activeTab === "veo3") {
      if (!veo3Data.isLoaded) {
        return (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-muted-foreground">{t("loading")}</p>
            </div>
          </div>
        );
      }

      if (veo3Data.tasks.length === 0) {
        return <EmptyState locale={locale} />;
      }

      return (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {veo3Data.tasks.map((task) => (
            <Veo3HistoryCard
              key={task.task_id}
              task={task}
              onViewVideo={() => setSelectedVeo3Video(task)}
              onDelete={(taskId) => {
                setDeleteTaskId(taskId);
                setDeleteTabType("veo3");
              }}
            />
          ))}
        </div>
      );
    }

    if (activeTab === "upscaler") {
      if (!upscalerData.isLoaded) {
        return (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-muted-foreground">{t("loading")}</p>
            </div>
          </div>
        );
      }

      if (upscalerData.tasks.length === 0) {
        return <EmptyState locale={locale} />;
      }

      return (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {upscalerData.tasks.map((task) => (
            <UpscalerHistoryCard
              key={task.task_id}
              task={task}
              onViewComparison={() => setSelectedUpscalerTask(task)}
              onDelete={(taskId) => {
                setDeleteTaskId(taskId);
                setDeleteTabType("upscaler");
              }}
            />
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="container py-10">
      {/* 页面标题 */}
      <PageHeader />

      {/* Tab 切换 */}
      <HistoryTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 内容区域 */}
      {renderContent()}

      {/* 对话框 - Nano Banana 图片查看 */}
      <ImagePreviewDialog
        images={selectedImages}
        onClose={() => setSelectedImages(null)}
        onDownload={handlePreviewDownload}
      />

      {/* 对话框 - Veo3 视频预览 */}
      {selectedVeo3Video && (
        <Veo3VideoDialog
          isOpen={!!selectedVeo3Video}
          onClose={() => setSelectedVeo3Video(null)}
          video720pUrl={selectedVeo3Video.video_720p_url}
          video1080pUrl={selectedVeo3Video.video_1080p_url}
          has1080p={selectedVeo3Video.has_1080p}
          prompt={selectedVeo3Video.input.prompt}
        />
      )}

      {/* 对话框 - Upscaler 对比 */}
      {selectedUpscalerTask && (
        <UpscalerCompareDialog
          isOpen={!!selectedUpscalerTask}
          onClose={() => setSelectedUpscalerTask(null)}
          originalImage={selectedUpscalerTask.input.original_image_url}
          upscaledImage={selectedUpscalerTask.upscaled_image_url || ""}
          scale={selectedUpscalerTask.input.scale}
          faceEnhance={selectedUpscalerTask.input.face_enhance}
        />
      )}

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        isOpen={!!deleteTaskId}
        onClose={() => {
          setDeleteTaskId(null);
          setDeleteTabType(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
