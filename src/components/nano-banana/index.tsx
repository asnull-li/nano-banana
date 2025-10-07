"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/contexts/app";

// 导入样式
import "./components/styles.css";

// 导入重新设计的组件
import { useNanoBanana } from "./hooks/use-nano-banana";
import OperationPanel from "./components/OperationPanel";
import DisplayPanel from "./components/DisplayPanel";

export interface NanoBananaWorkspaceProps {
  className?: string;
  defaultMode?: "text-to-image" | "image-to-image";
  onComplete?: (results: any[]) => void;
}

export default function NanoBananaWorkspace({
  className,
  defaultMode = "image-to-image",
  onComplete,
}: NanoBananaWorkspaceProps) {
  const { fetchUserInfo } = useAppContext();

  // 包装 onComplete 回调，在完成后刷新用户信息
  const handleComplete = (results: any[]) => {
    onComplete?.(results);
    fetchUserInfo?.();
  };

  const {
    mode,
    uploadedImages,
    prompt,
    status,
    progress,
    results,
    taskId,
    aiDescription,
    errorMessage,
    imageSize,
    setMode,
    setPrompt,
    setImageSize,
    addImages,
    addImageFromUrl,
    removeImage,
    clearImages,
    submitTask,
    cancelTask,
    reset,
    cleanup,
  } = useNanoBanana({ onComplete: handleComplete });

  // 设置默认模式
  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode, setMode]);

  // 清理资源
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return (
    <div className={cn("w-full h-full overflow-hidden ", className)}>
      {/* 左右分屏布局 */}
      <div className="nano-workspace grid grid-cols-1 lg:grid-cols-[500px_1fr] gap-4 h-full min-h-[700px] py-4 px-0 lg:px-4">
        {/* 左侧操作面板 - 卡片形式 */}
        <div className="operation-panel bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-zinc-700/50 rounded-xl shadow-xl">
          <div className="h-full nano-scrollbar overflow-y-auto p-1">
            <OperationPanel
              mode={mode}
              uploadedImages={uploadedImages}
              prompt={prompt}
              status={status}
              imageSize={imageSize}
              onModeChange={setMode}
              onAddImages={addImages}
              onRemoveImage={removeImage}
              onClearImages={clearImages}
              onPromptChange={setPrompt}
              onImageSizeChange={setImageSize}
              onSubmit={submitTask}
            />
          </div>
        </div>

        {/* 右侧展示面板 - 卡片形式 */}
        <div className="bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-zinc-700/50 rounded-xl shadow-xl">
          <DisplayPanel
            status={status}
            progress={progress}
            results={results}
            taskId={taskId || undefined}
            aiDescription={aiDescription}
            errorMessage={errorMessage}
            onCancel={cancelTask}
            onReset={reset}
            onRetry={submitTask}
            onContinueEdit={addImageFromUrl}
          />
        </div>
      </div>
    </div>
  );
}
