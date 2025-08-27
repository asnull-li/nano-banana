"use client";

import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Image as ImageIcon, Sparkles } from "lucide-react";
import { useAppContext } from "@/contexts/app";
import { useTranslations } from "next-intl";

// 导入子组件
import { useNanoBanana } from "./hooks/use-nano-banana";
import ImageToImageMode from "./image-to-image";
import TextToImageMode from "./text-to-image";
import GenerationStatus from "./shared/generation-status";
import ResultGallery from "./shared/result-gallery";

export interface NanoBananaWorkspaceProps {
  className?: string;
  defaultMode?: "text-to-image" | "image-to-image";
  onComplete?: (results: any[]) => void;
}

export default function NanoBananaWorkspace({
  className,
  defaultMode = "text-to-image",
  onComplete,
}: NanoBananaWorkspaceProps) {
  const { fetchUserInfo } = useAppContext();
  const t = useTranslations("nano_banana.mode_selector");

  // 包装 onComplete 回调，在完成后刷新用户信息
  const handleComplete = (results: any[]) => {
    // 调用原始的 onComplete
    onComplete?.(results);

    // 刷新用户积分信息
    fetchUserInfo?.();
  };

  const {
    mode,
    uploadedImages,
    prompt,
    numImages,
    status,
    progress,
    results,
    taskId,
    aiDescription,
    setMode,
    setPrompt,
    setNumImages,
    addImages,
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
    <div className={cn("w-full space-y-6", className)}>
      {/* 模式选择器 */}
      <Card className="p-1 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="grid grid-cols-2 gap-1">
          <Button
            variant="ghost"
            className={cn(
              "relative h-12 justify-center transition-all duration-300",
              mode === "image-to-image"
                ? "bg-gradient-to-r from-green-500 to-cyan-500 text-white shadow-lg shadow-green-500/25 scale-[1.02]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50"
            )}
            onClick={() => setMode("image-to-image")}
          >
            <ImageIcon
              className={cn(
                "h-5 w-5 mr-2",
                mode === "image-to-image" ? "text-white" : "text-green-500"
              )}
            />
            <span className="font-semibold">{t("edit_mode")}</span>
            {mode === "image-to-image" && (
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg opacity-20 blur-sm" />
            )}
          </Button>

          <Button
            variant="ghost"
            className={cn(
              "relative h-12 justify-center transition-all duration-300",
              mode === "text-to-image"
                ? "bg-gradient-to-r from-green-500 to-cyan-500 text-white shadow-lg shadow-green-500/25 scale-[1.02]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50"
            )}
            onClick={() => setMode("text-to-image")}
          >
            <Sparkles
              className={cn(
                "h-5 w-5 mr-2",
                mode === "text-to-image" ? "text-white" : "text-cyan-500"
              )}
            />
            <span className="font-semibold">{t("text_mode")}</span>
            {mode === "text-to-image" && (
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg opacity-20 blur-sm" />
            )}
          </Button>
        </div>
      </Card>

      {/* 生成状态 */}
      <GenerationStatus
        status={status}
        progress={progress}
        taskId={taskId}
        onCancel={cancelTask}
      />

      {/* 结果展示 */}
      {results.length > 0 && (
        <ResultGallery
          results={results}
          mode={mode}
          aiDescription={aiDescription}
          onReset={reset}
        />
      )}

      {/* 主内容区 - 仅在没有结果时显示 */}
      {results.length === 0 && (
        <div className="animate-in fade-in-0 duration-500">
          {mode === "image-to-image" ? (
            <ImageToImageMode
              uploadedImages={uploadedImages}
              prompt={prompt}
              numImages={numImages}
              status={status}
              onAddImages={addImages}
              onRemoveImage={removeImage}
              onClearImages={clearImages}
              onPromptChange={setPrompt}
              onNumImagesChange={setNumImages}
              onSubmit={submitTask}
            />
          ) : (
            <TextToImageMode
              prompt={prompt}
              numImages={numImages}
              status={status}
              onPromptChange={setPrompt}
              onNumImagesChange={setNumImages}
              onSubmit={submitTask}
            />
          )}
        </div>
      )}
    </div>
  );
}
