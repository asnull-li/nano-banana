"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Film,
  Maximize2,
  Info,
  Monitor,
  Smartphone,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { Veo3Model, AspectRatio, Veo3TaskType } from "../types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Veo3ControlsProps {
  mode: Veo3TaskType;
  model: Veo3Model;
  onModelChange: (model: Veo3Model) => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  watermark?: string;
  onWatermarkChange: (watermark: string) => void;
  seeds?: number;
  onSeedsChange: (seeds: number | undefined) => void;
  enableTranslation?: boolean;
  onEnableTranslationChange: (enabled: boolean) => void;
  disabled?: boolean;
  className?: string;
  texts?: any;
}

export default function Veo3Controls({
  mode,
  model,
  onModelChange,
  aspectRatio,
  onAspectRatioChange,
  watermark,
  onWatermarkChange,
  seeds,
  onSeedsChange,
  enableTranslation = true,
  onEnableTranslationChange,
  disabled = false,
  className,
  texts = {},
}: Veo3ControlsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const modelOptions: Array<{
    value: Veo3Model;
    label: string;
    description: string;
  }> = [
    {
      value: "veo3_fast",
      label: texts.model_fast || "Fast Mode",
      description: texts.model_fast_desc || "Quick generation",
    },
    {
      value: "veo3",
      label: texts.model_quality || "Quality Mode",
      description: texts.model_quality_desc || "High quality output",
    },
  ];

  const allAspectRatioOptions: Array<{
    value: AspectRatio;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    supports1080p: boolean;
  }> = [
    { value: "16:9", label: "16:9", icon: Monitor, supports1080p: true },
    { value: "9:16", label: "9:16", icon: Smartphone, supports1080p: false },
    { value: "Auto", label: "Auto", icon: Sparkles, supports1080p: false },
  ];

  // Filter aspect ratio options based on mode
  const aspectRatioOptions = allAspectRatioOptions.filter(option => {
    // Auto is only available in image-to-video mode
    if (option.value === "Auto") {
      return mode === "image-to-video";
    }
    return true;
  });

  return (
    <div className={className}>
      <div className="space-y-5">
        {/* Model Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-emerald-500" />
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {texts.model_label || "Model"}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {texts.model_tooltip_line1 || "Fast Mode: Quick generation"}
                    <br />
                    {texts.model_tooltip_line2 || "Quality Mode: Best quality output"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {modelOptions.map((option) => {
              const isSelected = model === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => onModelChange(option.value)}
                  disabled={disabled}
                  className={`
                      p-3 rounded-lg border transition-all duration-200 text-left relative overflow-hidden
                      ${
                        isSelected
                          ? "border-emerald-500/60 bg-emerald-500/10 dark:bg-emerald-500/20"
                          : "border-slate-200/80 dark:border-slate-600/60 hover:border-emerald-400/60 dark:hover:border-emerald-400/60 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10"
                      }
                      ${
                        disabled
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer hover:scale-105"
                      }
                    `}
                >
                  <div className="space-y-1">
                    <div
                      className={`text-sm font-semibold ${
                        isSelected
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {option.label}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {option.description}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Aspect Ratio */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-cyan-500" />
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {texts.aspect_ratio_label || "Aspect Ratio"}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {texts.aspect_ratio_tooltip_line1 || "16:9 supports 1080P upgrade"}
                    <br />
                    {texts.aspect_ratio_tooltip_line2 || "9:16 for mobile videos"}
                    <br />
                    {texts.aspect_ratio_tooltip_line3 || "Auto lets AI decide"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex gap-1.5 w-full">
            {aspectRatioOptions.map((option) => {
              const isSelected = aspectRatio === option.value;
              const IconComponent = option.icon;

              return (
                <button
                  key={option.value}
                  onClick={() => onAspectRatioChange(option.value)}
                  disabled={disabled}
                  className={`
                      flex-1 px-3 py-2 rounded-lg border transition-all duration-200 relative flex items-center justify-center gap-1.5
                      ${
                        isSelected
                          ? "border-cyan-500/60 bg-cyan-500/10 dark:bg-cyan-500/20"
                          : "border-slate-200/80 dark:border-slate-600/60 hover:border-cyan-400/60 dark:hover:border-cyan-400/60 hover:bg-cyan-50/50 dark:hover:bg-cyan-500/10"
                      }
                      ${
                        disabled
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer hover:scale-105"
                      }
                    `}
                >
                  <IconComponent
                    className={`w-4 h-4 ${
                      isSelected
                        ? "text-cyan-600 dark:text-cyan-400"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  />
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-xs font-semibold ${
                        isSelected
                          ? "text-cyan-600 dark:text-cyan-400"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {option.label}
                    </span>
                    {option.supports1080p && (
                      <span className="text-[10px] text-green-600 dark:text-green-400">
                        HD
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Advanced Options */}
        <div className="p-3 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-lg border border-emerald-200/50 dark:border-emerald-700/30">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between text-left group"
          >
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              {texts.advanced_options || "Advanced Options"}
            </Label>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
            )}
          </button>

          {showAdvanced && (
            <div className="space-y-3 mt-3">
              {/* Watermark */}
              <div className="space-y-2">
                <Label
                  htmlFor="watermark"
                  className="text-sm text-slate-600 dark:text-slate-400"
                >
                  {texts.watermark_label || "Watermark"}
                </Label>
                <Input
                  id="watermark"
                  value={watermark || ""}
                  onChange={(e) => onWatermarkChange(e.target.value)}
                  disabled={disabled}
                  placeholder={texts.watermark_placeholder || "Add text watermark..."}
                  className="text-sm h-10"
                />
              </div>

              {/* Seeds */}
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label
                    htmlFor="seeds"
                    className="text-sm text-slate-600 dark:text-slate-400"
                  >
                    {texts.random_seed_label || "Random Seed"}
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-xs">
                          {texts.random_seed_tooltip_line1 || "Controls video randomness (10000-99999)."}
                          <br />
                          {texts.random_seed_tooltip_line2 || "Same seed generates similar videos."}
                          <br />
                          {texts.random_seed_tooltip_line3 || "Leave empty for auto-assignment."}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="seeds"
                  type="number"
                  min={10000}
                  max={99999}
                  value={seeds || ""}
                  onChange={(e) =>
                    onSeedsChange(
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  disabled={disabled}
                  placeholder={texts.random_seed_placeholder || "10000 - 99999"}
                  className="text-sm h-10"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {texts.random_seed_hint || "Same seed generates similar videos. Leave empty to auto-assign."}
                </p>
              </div>

              {/* Enable Translation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Label
                      htmlFor="enableTranslation"
                      className="text-sm text-slate-600 dark:text-slate-400"
                    >
                      {texts.auto_translate_label || "Auto-Translate Prompt"}
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs max-w-xs">
                            {texts.auto_translate_tooltip_line1 || "Automatically translate non-English prompts to English for better video generation quality."}
                            <br />
                            {texts.auto_translate_tooltip_line2 || "Recommended to keep enabled for optimal results."}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Switch
                    id="enableTranslation"
                    checked={enableTranslation}
                    onCheckedChange={onEnableTranslationChange}
                    disabled={disabled}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {enableTranslation
                    ? (texts.auto_translate_enabled || "Prompts will be translated to English automatically")
                    : (texts.auto_translate_disabled || "Original prompt language will be used")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
