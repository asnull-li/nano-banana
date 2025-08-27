"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Lightbulb, Images, Sparkles, Zap, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiImageTipProps {
  className?: string;
}

export default function MultiImageTip({ className }: MultiImageTipProps) {
  return (
    <Card
      className={cn(
        "p-4 bg-gradient-to-r from-green-500/5 to-cyan-500/5 border-green-500/20",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-r from-green-500/10 to-cyan-500/10 shrink-0">
          <Lightbulb className="h-5 w-5 text-green-500" />
        </div>
        <div className="space-y-2 flex-1">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Images className="h-4 w-4 text-cyan-500" />
            对话式图像编辑
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            上传{" "}
            <span className="font-semibold text-green-600 dark:text-green-400">
              多张参考图
            </span>
            （最多10张），通过自然对话描述编辑需求，AI 智能理解并精准执行。
          </p>
          <div className="flex items-center gap-4 pt-1">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-green-500" />
              <span className="text-xs text-muted-foreground">对话编辑</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-cyan-500" />
              <span className="text-xs text-muted-foreground">多图参考</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
              <span className="text-xs text-muted-foreground">智能理解</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
