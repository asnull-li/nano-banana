"use client";

import { Label } from "@/components/ui/label";
import { Clock, Monitor, Smartphone, Square, Maximize2 } from "lucide-react";
import {
  Wan25AspectRatio,
  Wan25Duration,
  Wan25Resolution,
} from "../types";

interface Wan25ControlsProps {
  mode: "text-to-video" | "image-to-video";
  duration: Wan25Duration;
  onDurationChange: (duration: Wan25Duration) => void;
  resolution: Wan25Resolution;
  onResolutionChange: (resolution: Wan25Resolution) => void;
  aspectRatio: Wan25AspectRatio;
  onAspectRatioChange: (ratio: Wan25AspectRatio) => void;
  disabled?: boolean;
  texts?: any;
}

export default function Wan25Controls({
  mode,
  duration,
  onDurationChange,
  resolution,
  onResolutionChange,
  aspectRatio,
  onAspectRatioChange,
  disabled = false,
  texts = {},
}: Wan25ControlsProps) {
  const durationOptions: Array<{
    value: Wan25Duration;
    label: string;
  }> = [
    { value: "5", label: texts.duration_5s || "5s" },
    { value: "10", label: texts.duration_10s || "10s" },
  ];

  const resolutionOptions: Array<{
    value: Wan25Resolution;
    label: string;
  }> = [
    { value: "720p", label: texts.resolution_720p || "720p" },
    { value: "1080p", label: texts.resolution_1080p || "1080p" },
  ];

  const aspectRatioOptions: Array<{
    value: Wan25AspectRatio;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      value: "16:9",
      label: texts.aspect_16_9 || "16:9",
      icon: Monitor,
    },
    {
      value: "9:16",
      label: texts.aspect_9_16 || "9:16",
      icon: Smartphone,
    },
    {
      value: "1:1",
      label: texts.aspect_1_1 || "1:1",
      icon: Square,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Duration */}
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

      {/* Resolution */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Maximize2 className="w-4 h-4 text-purple-500" />
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {texts.resolution_label || "Resolution"}
          </Label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {resolutionOptions.map((option) => {
            const isSelected = resolution === option.value;

            return (
              <button
                key={option.value}
                onClick={() => onResolutionChange(option.value)}
                disabled={disabled}
                className={`
                  p-3 rounded-lg border transition-all duration-200 relative flex items-center justify-center
                  ${
                    isSelected
                      ? "border-purple-500/60 bg-purple-500/10 dark:bg-purple-500/20"
                      : "border-slate-200/80 dark:border-slate-600/60 hover:border-purple-400/60 dark:hover:border-purple-400/60 hover:bg-purple-50/50 dark:hover:bg-purple-500/10"
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
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {option.label}
                </span>
                {isSelected && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Aspect Ratio - 仅 text-to-video 模式 */}
      {mode === "text-to-video" ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-cyan-500" />
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {texts.aspect_ratio_label || "Aspect Ratio"}
            </Label>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {aspectRatioOptions.map((option) => {
              const isSelected = aspectRatio === option.value;
              const IconComponent = option.icon;

              return (
                <button
                  key={option.value}
                  onClick={() => onAspectRatioChange(option.value)}
                  disabled={disabled}
                  className={`
                    p-3 rounded-lg border transition-all duration-200 relative flex flex-col items-center justify-center gap-1
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
                  <span
                    className={`text-xs font-semibold ${
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
      ) : (
        // Image-to-video 模式提示信息
        <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-800/50">
          <div className="flex items-start gap-2">
            <Maximize2 className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                {texts.aspect_ratio_tip || "The output video aspect ratio will match your uploaded image"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
