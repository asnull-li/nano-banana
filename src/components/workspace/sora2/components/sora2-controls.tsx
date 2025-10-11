"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Maximize2, Monitor, Smartphone } from "lucide-react";
import { Sora2AspectRatio } from "../types";

interface Sora2ControlsProps {
  aspectRatio: Sora2AspectRatio;
  onAspectRatioChange: (ratio: Sora2AspectRatio) => void;
  removeWatermark: boolean;
  onRemoveWatermarkChange: (remove: boolean) => void;
  disabled?: boolean;
  texts?: any;
}

export default function Sora2Controls({
  aspectRatio,
  onAspectRatioChange,
  removeWatermark,
  onRemoveWatermarkChange,
  disabled = false,
  texts = {},
}: Sora2ControlsProps) {
  const aspectRatioOptions: Array<{
    value: Sora2AspectRatio;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { value: "landscape", label: texts.landscape || "Landscape", icon: Monitor },
    { value: "portrait", label: texts.portrait || "Portrait", icon: Smartphone },
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
