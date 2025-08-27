"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Wand2,
  Loader2,
  Settings,
  Lightbulb,
  Palette,
  Zap,
  Image as ImageIcon,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CREDITS_PER_IMAGE } from "@/lib/constants/nano-banana";
import { useCredits } from "@/hooks/use-credits";
import { useAppContext } from "@/contexts/app";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface EditControlsProps {
  prompt: string;
  numImages: number;
  onPromptChange: (prompt: string) => void;
  onNumImagesChange: (num: number) => void;
  onSubmit: () => void;
  isProcessing?: boolean;
  disabled?: boolean;
}

const quickPrompts = [
  {
    icon: Lightbulb,
    label: "增强细节",
    prompt: "enhance details, ultra HD, sharp focus",
  },
  {
    icon: Palette,
    label: "艺术风格",
    prompt: "artistic style, oil painting, vibrant colors",
  },
  {
    icon: Zap,
    label: "动漫风格",
    prompt: "anime style, cel shading, manga art",
  },
  {
    icon: ImageIcon,
    label: "写实照片",
    prompt: "photorealistic, professional photography, 8K",
  },
];

export default function EditControls({
  prompt,
  numImages,
  onPromptChange,
  onNumImagesChange,
  onSubmit,
  isProcessing = false,
  disabled = false,
}: EditControlsProps) {
  const { credits, isLoading: creditsLoading } = useCredits();
  const { user, setShowSignModal } = useAppContext();
  const router = useRouter();
  const totalCredits = CREDITS_PER_IMAGE * numImages;
  const hasEnoughCredits = credits.left_credits >= totalCredits;
  const canSubmit = prompt.trim().length >= 3 && !isProcessing && !disabled;
  
  const handleSubmit = () => {
    // 检查登录状态
    if (!user) {
      toast.error("请先登录账号");
      setShowSignModal(true);
      return;
    }
    
    // 检查积分是否充足
    if (!hasEnoughCredits) {
      toast.error(`积分不足，需要 ${totalCredits} 积分，当前只有 ${credits.left_credits} 积分`);
      setTimeout(() => {
        router.push("/pricing");
      }, 1500);
      return;
    }
    
    // 调用原始提交函数
    onSubmit();
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="space-y-4">
          {/* 标题 */}
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-500" />
            <h3 className="text-lg font-semibold bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent">
              AI 图像编辑
            </h3>
          </div>

          {/* 快速提示词 */}
          <div className="space-y-2">
            <Label className="text-sm">快速风格</Label>
            <div className="grid grid-cols-2 gap-2">
              {quickPrompts.map((item, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  className="justify-start border-green-500/20 hover:border-green-500/40 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10 transition-all duration-300"
                  onClick={() => {
                    if (prompt) {
                      onPromptChange(`${prompt}, ${item.prompt}`);
                    } else {
                      onPromptChange(item.prompt);
                    }
                  }}
                >
                  <item.icon className="h-4 w-4 mr-2 text-green-500" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          {/* 提示词输入 */}
          <div className="space-y-2">
            <Label htmlFor="prompt" className="flex items-center gap-2">
              描述你想要的效果
              <span className="text-xs text-muted-foreground">
                ({prompt.length}/5000)
              </span>
            </Label>
            <Textarea
              id="prompt"
              placeholder="例如: 将图片转换为油画风格，增加暖色调，让画面更加生动..."
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              className={cn(
                "min-h-[120px] resize-none transition-colors",
                "focus:border-green-500 focus:ring-green-500"
              )}
              maxLength={5000}
              disabled={disabled || isProcessing}
            />
          </div>

          {/* 生成数量设置 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="num-images" className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-green-500" />
                生成数量
              </Label>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium px-2 py-1 rounded bg-green-500/10 text-green-600 dark:text-green-400">
                  {numImages} 张
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "flex items-center gap-1",
                    hasEnoughCredits
                      ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                      : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
                  )}
                >
                  <Coins className="h-3 w-3" />
                  <span className="font-semibold">{totalCredits}</span>
                  <span className="text-xs">积分</span>
                </Badge>
              </div>
            </div>
            <Slider
              id="num-images"
              min={1}
              max={4}
              step={1}
              value={[numImages]}
              onValueChange={(value) => onNumImagesChange(value[0])}
              disabled={disabled || isProcessing}
              className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-green-500 [&_[role=slider]]:to-cyan-500"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 张</span>
              <span>2 张</span>
              <span>3 张</span>
              <span>4 张</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 提交按钮 */}
      <Button
        className={cn(
          "w-full h-12 text-base font-semibold",
          "bg-gradient-to-r from-green-500 to-cyan-500",
          "hover:from-green-600 hover:to-cyan-600",
          "text-white border-0 shadow-lg",
          "shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30",
          "transition-all duration-300",
          canSubmit && "hover:scale-[1.02]",
          (isProcessing || disabled || prompt.trim().length < 3) && "opacity-50 cursor-not-allowed"
        )}
        onClick={handleSubmit}
        disabled={isProcessing || disabled || prompt.trim().length < 3}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            正在处理中...
          </>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <Wand2 className="h-5 w-5" />
            <span>开始生成 ({numImages} 张)</span>
            <Badge className="bg-white/20 text-white border-0">
              <Coins className="h-3 w-3 mr-1" />
              {totalCredits}
            </Badge>
          </div>
        )}
      </Button>

      {/* 提示信息 */}
      {!canSubmit && !isProcessing && (
        <p className="text-sm text-center text-red-500">
          {!hasEnoughCredits && !creditsLoading
            ? `积分不足，需要 ${totalCredits} 积分`
            : prompt.trim().length < 3
            ? "请输入至少 3 个字符的提示词"
            : "请先上传图片"}
        </p>
      )}
    </div>
  );
}
