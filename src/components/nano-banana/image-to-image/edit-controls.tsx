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
import { useTranslations } from "next-intl";
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
  const t = useTranslations();
  const totalCredits = CREDITS_PER_IMAGE * numImages;
  const hasEnoughCredits = credits.left_credits >= totalCredits;
  const canSubmit = prompt.trim().length >= 3 && !isProcessing && !disabled;
  
  const quickPrompts = [
    {
      icon: Lightbulb,
      label: t("nano_banana.image_to_image.enhance_details"),
      prompt: t("nano_banana.image_to_image.enhance_details_prompt"),
    },
    {
      icon: Palette,
      label: t("nano_banana.image_to_image.art_style"),
      prompt: t("nano_banana.image_to_image.art_style_prompt"),
    },
    {
      icon: Zap,
      label: t("nano_banana.image_to_image.anime_style"),
      prompt: t("nano_banana.image_to_image.anime_style_prompt"),
    },
    {
      icon: ImageIcon,
      label: t("nano_banana.image_to_image.realistic_photo"),
      prompt: t("nano_banana.image_to_image.realistic_photo_prompt"),
    },
  ];
  
  const handleSubmit = () => {
    // 检查登录状态
    if (!user) {
      toast.error(t("nano_banana.image_to_image.please_login"));
      setShowSignModal(true);
      return;
    }
    
    // 检查积分是否充足
    if (!hasEnoughCredits) {
      toast.error(t("nano_banana.image_to_image.insufficient_credits_detail", { needed: totalCredits, current: credits.left_credits }));
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
              {t("nano_banana.image_to_image.ai_editing")}
            </h3>
          </div>

          {/* 快速提示词 */}
          <div className="space-y-2">
            <Label className="text-sm">{t("nano_banana.image_to_image.quick_style")}</Label>
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
              {t("nano_banana.image_to_image.describe_effect")}
              <span className="text-xs text-muted-foreground">
                ({prompt.length}/5000)
              </span>
            </Label>
            <Textarea
              id="prompt"
              placeholder={t("nano_banana.image_to_image.prompt_placeholder")}
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
                {t("nano_banana.image_to_image.generate_count")}
              </Label>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium px-2 py-1 rounded bg-green-500/10 text-green-600 dark:text-green-400">
                  {t("nano_banana.image_to_image.count_images", { count: numImages })}
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
                  <span className="text-xs">{t("nano_banana.image_to_image.credits")}</span>
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
              <span>{t("nano_banana.image_to_image.count_images", { count: 1 })}</span>
              <span>{t("nano_banana.image_to_image.count_images", { count: 2 })}</span>
              <span>{t("nano_banana.image_to_image.count_images", { count: 3 })}</span>
              <span>{t("nano_banana.image_to_image.count_images", { count: 4 })}</span>
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
            {t("nano_banana.image_to_image.processing")}
          </>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <Wand2 className="h-5 w-5" />
            <span>{t("nano_banana.image_to_image.start_generation", { count: numImages })}</span>
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
            ? t("nano_banana.image_to_image.insufficient_credits", { needed: totalCredits })
            : prompt.trim().length < 3
            ? t("nano_banana.image_to_image.prompt_too_short")
            : t("nano_banana.image_to_image.please_upload_image")}
        </p>
      )}
    </div>
  );
}
