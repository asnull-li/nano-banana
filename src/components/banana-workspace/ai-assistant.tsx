"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Bot, Zap } from "lucide-react";

interface AIAssistantProps {
  isGenerating: boolean;
  progress: number;
  message?: string;
  className?: string;
}

export default function AIAssistant({ isGenerating, progress, message, className }: AIAssistantProps) {
  const [dots, setDots] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(message);

  // 动态显示省略号动画
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setDots((prev) => (prev + 1) % 4);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  // 根据进度更新消息
  useEffect(() => {
    if (isGenerating) {
      if (progress < 20) {
        setCurrentMessage("Preparing your request");
      } else if (progress < 40) {
        setCurrentMessage("Processing image data");
      } else if (progress < 60) {
        setCurrentMessage("Applying AI transformations");
      } else if (progress < 80) {
        setCurrentMessage("Finalizing generation");
      } else if (progress < 95) {
        setCurrentMessage("Final touches");
      } else {
        setCurrentMessage("Almost ready");
      }
    } else if (message) {
      setCurrentMessage(message);
    }
  }, [progress, isGenerating, message]);

  if (!isGenerating) return null;

  return (
    <div className={cn("w-full", className)}>
      <div className="relative rounded-xl bg-green-50 dark:bg-green-900/20 p-6 shadow-lg">

        <div className="relative space-y-4">
          {/* AI Assistant 头像和标题 */}
          <div className="flex items-center justify-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
                Nano Banana AI
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentMessage}{".".repeat(dots)}
              </p>
            </div>
          </div>

          {/* 进度条 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-green-600">{progress}%</span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 生成提示 */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-500" />
              <span>High-speed generation</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-green-600" />
              <span>AI powered</span>
            </div>
          </div>

          {/* 生成动画点 */}
          <div className="flex justify-center gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-green-500"
                style={{
                  animation: `bounce 1.4s ease-in-out ${i * 0.1}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}