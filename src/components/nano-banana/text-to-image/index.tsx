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
  Mountain,
  User,
  Palette,
  Zap,
  Building,
  Trees,
  Cat,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CREDITS_PER_IMAGE } from "@/lib/constants/nano-banana";
import { useCredits } from "@/hooks/use-credits";
import { useAppContext } from "@/contexts/app";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface TextToImageModeProps {
  prompt: string;
  numImages: number;
  status: string;
  onPromptChange: (prompt: string) => void;
  onNumImagesChange: (num: number) => void;
  onSubmit: () => void;
}

const getInspirations = (t: any) => [
  {
    icon: Mountain,
    labelKey: "landscape",
    promptKey: "landscape",
  },
  {
    icon: User,
    labelKey: "portrait", 
    promptKey: "portrait",
  },
  {
    icon: Building,
    labelKey: "architecture",
    promptKey: "architecture",
  },
  {
    icon: Palette,
    labelKey: "art",
    promptKey: "art",
  },
  {
    icon: Zap,
    labelKey: "sci_fi",
    promptKey: "sci_fi",
  },
  {
    icon: Trees,
    labelKey: "nature",
    promptKey: "nature",
  },
  {
    icon: Cat,
    labelKey: "animals",
    promptKey: "animals",
  },
  {
    icon: Lightbulb,
    labelKey: "creative",
    promptKey: "creative",
  },
];

export default function TextToImageMode({
  prompt,
  numImages,
  status,
  onPromptChange,
  onNumImagesChange,
  onSubmit,
}: TextToImageModeProps) {
  const { credits } = useCredits();
  const { user, setShowSignModal } = useAppContext();
  const router = useRouter();
  const t = useTranslations("nano_banana.text_to_image");
  const tLabels = useTranslations("nano_banana.text_to_image.labels");
  const tPrompts = useTranslations("nano_banana.text_to_image.prompts");
  const totalCredits = CREDITS_PER_IMAGE * numImages;
  const hasEnoughCredits = credits.left_credits >= totalCredits;
  const isProcessing = ["uploading", "processing", "fetching"].includes(status);
  const canSubmit = prompt.trim().length >= 3 && !isProcessing;
  const inspirations = getInspirations(t);
  
  const handleSubmit = () => {
    // 检查登录状态
    if (!user) {
      toast.error(t("validation.please_login"));
      setShowSignModal(true);
      return;
    }
    
    // 检查积分是否充足
    if (!hasEnoughCredits) {
      toast.error(t("validation.insufficient_credits", {
        needed: totalCredits,
        current: credits.left_credits
      }));
      setTimeout(() => {
        router.push("/pricing");
      }, 1500);
      return;
    }
    
    // 调用原始提交函数
    onSubmit();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 左侧 - 灵感和快速开始 */}
      <div className="lg:col-span-1">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-500" />
              <h3 className="text-lg font-semibold">{t("inspiration_title")}</h3>
            </div>

            <p className="text-sm text-muted-foreground">
              {t("inspiration_desc")}
            </p>

            <div className="flex flex-wrap gap-2">
              {inspirations.map((item, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "group transition-all duration-300",
                    "border-green-500/20 hover:border-green-500/40",
                    "hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10"
                  )}
                  onClick={() => onPromptChange(tPrompts(item.promptKey))}
                  disabled={isProcessing}
                >
                  <item.icon className="h-3 w-3 mr-1 text-green-500 group-hover:scale-110 transition-transform" />
                  {tLabels(item.labelKey)}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* 右侧 - 输入和控制 */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="p-6">
          <div className="space-y-4">
            {/* 标题 */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent">
                {t("main_title")}
              </h3>
              <Badge
                variant="outline"
                className="border-green-500/30 text-green-600 dark:text-green-400"
              >
                {t("mode_badge")}
              </Badge>
            </div>

            {/* 提示词输入 */}
            <div className="space-y-2">
              <Label
                htmlFor="prompt"
                className="flex items-center justify-between"
              >
                <span>{t("prompt_label")}</span>
                <span className="text-xs text-muted-foreground">
                  {t("char_count", { count: prompt.length })}
                </span>
              </Label>
              <Textarea
                id="prompt"
                placeholder={t("prompt_placeholder")}
                value={prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                className={cn(
                  "min-h-[150px] resize-none transition-all",
                  "focus:border-green-500 focus:ring-green-500",
                  "placeholder:text-muted-foreground/60"
                )}
                maxLength={5000}
                disabled={isProcessing}
              />
            </div>

            {/* 生成数量设置 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="num-images" className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-green-500" />
                  {t("generation_count")}
                </Label>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium px-2 py-1 rounded bg-green-500/10 text-green-600 dark:text-green-400">
                    {t("count_unit", { count: numImages })}
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
                    <span className="text-xs">{t("credits_label")}</span>
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
                disabled={isProcessing}
                className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-green-500 [&_[role=slider]]:to-cyan-500"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t("count_unit", { count: 1 })}</span>
                <span>{t("count_unit", { count: 2 })}</span>
                <span>{t("count_unit", { count: 3 })}</span>
                <span>{t("count_unit", { count: 4 })}</span>
              </div>
            </div>

            {/* 提示信息 */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/5 to-cyan-500/5 border border-green-500/20">
              <p className="text-xs text-muted-foreground">
                {t("tip_text")}
              </p>
            </div>
          </div>
        </Card>

        {/* 生成按钮 */}
        <Button
          className={cn(
            "w-full h-12 text-base font-semibold",
            "bg-gradient-to-r from-green-500 to-cyan-500",
            "hover:from-green-600 hover:to-cyan-600",
            "text-white border-0 shadow-lg",
            "shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30",
            "transition-all duration-300",
            canSubmit && "hover:scale-[1.02]",
            (isProcessing || prompt.trim().length < 3) && "opacity-50 cursor-not-allowed"
          )}
          onClick={handleSubmit}
          disabled={isProcessing || prompt.trim().length < 3}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              {t("generating_button")}
            </>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <Wand2 className="h-5 w-5" />
              <span>{t("generate_button", { count: numImages })}</span>
              <Badge className="bg-white/20 text-white border-0">
                <Coins className="h-3 w-3 mr-1" />
                {totalCredits}
              </Badge>
            </div>
          )}
        </Button>

        {/* 错误提示 */}
        {!canSubmit && !isProcessing && prompt.trim().length < 3 && (
          <p className="text-sm text-center text-red-500">
            {t("validation.prompt_too_short")}
          </p>
        )}
      </div>
    </div>
  );
}
