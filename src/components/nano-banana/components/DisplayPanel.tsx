"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";

// 导入子组件
import EmptyState from "./display/EmptyState";
import ProgressState from "./display/ProgressState";
import ErrorState from "./display/ErrorState";
import ImagePreview from "./display/ImagePreview";
import ThumbnailList from "./display/ThumbnailList";
import AIDescription from "./display/AIDescription";
import ImageActionBar from "./display/ImageActionBar";
import ImageViewerDialog from "./display/ImageViewerDialog";

interface DisplayPanelProps {
  status: string;
  progress: number;
  results: any[];
  taskId?: string;
  aiDescription?: string;
  errorMessage?: string;
  onCancel?: () => void;
  onReset?: () => void;
  onRetry?: () => void;
  onContinueEdit?: (imageUrl: string) => Promise<void>;
}

export default function DisplayPanel({
  status,
  progress,
  results,
  taskId,
  aiDescription,
  errorMessage,
  onCancel,
  onReset,
  onRetry,
  onContinueEdit,
}: DisplayPanelProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState(0);
  const [elapsedTime] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const isProcessing = ["uploading", "processing", "fetching"].includes(status);

  // 结果展示
  const ResultState = () => {
    const currentResult = results[selectedResult];

    const handleDownload = async () => {
      try {
        const response = await fetch(currentResult.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `nano-banana-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("图片下载成功");
      } catch (error) {
        toast.error("下载失败");
      }
    };

    const handleShare = async () => {
      try {
        await navigator.clipboard.writeText(currentResult.url);
        setCopiedId(currentResult.url);
        toast.success("链接已复制");
        setTimeout(() => setCopiedId(null), 2000);
      } catch (error) {
        toast.error("复制失败");
      }
    };

    return (
      <div className="h-full flex flex-col">
        {/* 顶部操作栏 */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-500" />
            <h3 className="font-bold bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent">
              生成完成！
            </h3>
            {results.length > 1 && (
              <Badge variant="secondary">
                {selectedResult + 1} / {results.length}
              </Badge>
            )}
          </div>

          {onReset && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="hover:border-green-500 hover:text-green-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              重新生成
            </Button>
          )}
        </div>

        {/* 主图展示 */}
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="w-full max-w-md max-h-96 aspect-square">
            <ImagePreview
              imageUrl={currentResult.url}
              onDownload={handleDownload}
              onShare={handleShare}
              isShared={copiedId === currentResult.url}
              onImageClick={() => setIsViewerOpen(true)}
            />
          </div>
        </div>

        {/* 多图缩略图 */}
        <ThumbnailList
          results={results}
          selectedResult={selectedResult}
          onSelect={setSelectedResult}
        />

        {/* 操作区 */}
        <ImageActionBar
          imageUrl={currentResult.url}
          onDownload={handleDownload}
          onContinueEdit={
            onContinueEdit ? () => onContinueEdit(currentResult.url) : undefined
          }
        />

        {/* AI 描述 */}
        {aiDescription && <AIDescription description={aiDescription} />}

        {/* 图片预览弹窗 */}
        <ImageViewerDialog
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          results={results}
          selectedResult={selectedResult}
          onSelect={setSelectedResult}
          onDownload={handleDownload}
        />
      </div>
    );
  };

  // 根据状态渲染不同内容
  return (
    <div className="h-full">
      {status === "idle" && results.length === 0 && <EmptyState />}
      {isProcessing && (
        <ProgressState
          progress={progress}
          elapsedTime={elapsedTime}
          taskId={taskId}
          onCancel={onCancel}
        />
      )}
      {status === "failed" && (
        <ErrorState
          title="生成失败"
          message={
            errorMessage ||
            "很抱歉，图片生成过程中遇到了问题。请稍后重试，如果问题持续存在，请联系我们的技术支持团队。"
          }
          onRetry={onRetry || onReset}
          supportEmail="support@nanobanana.org"
        />
      )}
      {results.length > 0 && status !== "failed" && <ResultState />}
    </div>
  );
}
