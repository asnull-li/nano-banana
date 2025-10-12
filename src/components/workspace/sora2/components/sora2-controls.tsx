"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Maximize2, Monitor, Smartphone, Clock, Sparkles } from "lucide-react";
import {
  Sora2AspectRatio,
  Sora2Model,
  Sora2Duration,
  Sora2Quality,
} from "../types";

interface Sora2ControlsProps {
  model: Sora2Model;
  aspectRatio: Sora2AspectRatio;
  onAspectRatioChange: (ratio: Sora2AspectRatio) => void;
  duration?: Sora2Duration;
  onDurationChange?: (duration: Sora2Duration) => void;
  quality?: Sora2Quality;
  onQualityChange?: (quality: Sora2Quality) => void;
  removeWatermark: boolean;
  onRemoveWatermarkChange: (remove: boolean) => void;
  disabled?: boolean;
  texts?: any;
}

export default function Sora2Controls({
  model,
  aspectRatio,
  onAspectRatioChange,
  duration,
  onDurationChange,
  quality,
  onQualityChange,
  removeWatermark,
  onRemoveWatermarkChange,
  disabled = false,
  texts = {},
}: Sora2ControlsProps) {
  const isPro = model === "sora2-pro";

  const aspectRatioOptions: Array<{
    value: Sora2AspectRatio;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      value: "landscape",
      label: texts.landscape || "Landscape",
      icon: Monitor,
    },
    {
      value: "portrait",
      label: texts.portrait || "Portrait",
      icon: Smartphone,
    },
  ];

  const durationOptions: Array<{
    value: Sora2Duration;
    label: string;
  }> = [
    { value: "10", label: texts.duration_10s || "10s" },
    { value: "15", label: texts.duration_15s || "15s" },
  ];

  const qualityOptions: Array<{
    value: Sora2Quality;
    label: string;
    description: string;
  }> = [
    {
      value: "standard",
      label: texts.quality_standard || "Standard",
      description: "720p",
    },
    {
      value: "high",
      label: texts.quality_high || "High",
      description: "1080p",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Aspect Ratio */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Maximize2 className="w-4 h-4 text-cyan-500" />
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {texts.aspect_ratio_label || "Aspect Ratio"}
          </Label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {aspectRatioOptions.map((option) => {
            const isSelected = aspectRatio === option.value;
            const IconComponent = option.icon;

            return (
              <button
                key={option.value}
                onClick={() => onAspectRatioChange(option.value)}
                disabled={disabled}
                className={`
                  p-3 rounded-lg border transition-all duration-200 relative flex items-center justify-center gap-2
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
                  className={`w-5 h-5 ${
                    isSelected
                      ? "text-cyan-600 dark:text-cyan-400"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                />
                <span
                  className={`text-sm font-semibold ${
                    isSelected
                      ? "text-cyan-600 dark:text-cyan-400"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {option.label}
                </span>
                {isSelected && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Duration - Only for Pro */}
      {isPro && duration && onDurationChange && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {texts.duration_label || "Duration"}
            </Label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {durationOptions.map((option) => {
              const isSelected = duration === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => onDurationChange(option.value)}
                  disabled={disabled}
                  className={`
                    p-3 rounded-lg border transition-all duration-200 relative flex items-center justify-center
                    ${
                      isSelected
                        ? "border-blue-500/60 bg-blue-500/10 dark:bg-blue-500/20"
                        : "border-slate-200/80 dark:border-slate-600/60 hover:border-blue-400/60 dark:hover:border-blue-400/60 hover:bg-blue-50/50 dark:hover:bg-blue-500/10"
                    }
                    ${
                      disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:scale-105"
                    }
                  `}
                >
                  <span
                    className={`text-sm font-semibold ${
                      isSelected
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {option.label}
                  </span>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quality - Only for Pro */}
      {isPro && quality && onQualityChange && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {texts.quality_label || "Quality"}
            </Label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {qualityOptions.map((option) => {
              const isSelected = quality === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => onQualityChange(option.value)}
                  disabled={disabled}
                  className={`
                    p-3 rounded-lg border transition-all duration-200 relative flex flex-col items-center justify-center gap-1
                    ${
                      isSelected
                        ? "border-amber-500/60 bg-amber-500/10 dark:bg-amber-500/20"
                        : "border-slate-200/80 dark:border-slate-600/60 hover:border-amber-400/60 dark:hover:border-amber-400/60 hover:bg-amber-50/50 dark:hover:bg-amber-500/10"
                    }
                    ${
                      disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:scale-105"
                    }
                  `}
                >
                  <span
                    className={`text-sm font-semibold ${
                      isSelected
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {option.label}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      isSelected
                        ? "text-amber-500 dark:text-amber-400"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {option.description}
                  </span>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Generation Time Notice - Only for Pro */}
      {isPro && (
        <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200/50 dark:border-amber-800/30">
          <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
            <span className="font-semibold">
              {texts.generation_time_title || "⏱️ Generation Time:"}
            </span>{" "}
            {texts.generation_time_desc ||
              "10s HD typically takes 10-20 minutes, 15s HD takes ~30 minutes (reflects OpenAI's native delivery speed). We strongly recommend using the 15s HD option with caution as it requires longer time and may have slight imperfections."}
          </p>
        </div>
      )}

      {/* Remove Watermark */}
      <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-2">
          <Label
            htmlFor="removeWatermark"
            className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            {texts.remove_watermark_label || "Remove Watermark"}
          </Label>
        </div>
        <Switch
          id="removeWatermark"
          checked={removeWatermark}
          onCheckedChange={onRemoveWatermarkChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
