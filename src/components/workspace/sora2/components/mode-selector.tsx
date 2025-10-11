"use client";

import { Film, Image } from "lucide-react";
import { Sora2TaskType } from "../types";

interface ModeSelectorProps {
  mode: Sora2TaskType;
  onModeChange: (mode: Sora2TaskType) => void;
  disabled?: boolean;
  texts?: any;
}

export default function ModeSelector({
  mode,
  onModeChange,
  disabled = false,
  texts = {},
}: ModeSelectorProps) {
  const modes: Array<{
    value: Sora2TaskType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      value: "text-to-video",
      label: texts.text_to_video || "Text to Video",
      icon: Film,
    },
    {
      value: "image-to-video",
      label: texts.image_to_video || "Image to Video",
      icon: Image,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {modes.map((modeOption) => {
        const isSelected = mode === modeOption.value;
        const IconComponent = modeOption.icon;

        return (
          <button
            key={modeOption.value}
            onClick={() => onModeChange(modeOption.value)}
            disabled={disabled}
            className={`
              p-3 rounded-lg border transition-all duration-200 relative
              ${
                isSelected
                  ? "border-emerald-500/60 bg-emerald-500/10 dark:bg-emerald-500/20"
                  : "border-slate-200/80 dark:border-slate-600/60 hover:border-emerald-400/60 dark:hover:border-emerald-400/60 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"}
            `}
          >
            <div className="flex items-center justify-center gap-2">
              <IconComponent
                className={`w-5 h-5 ${
                  isSelected
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              />
              <span
                className={`text-sm font-semibold ${
                  isSelected
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                {modeOption.label}
              </span>
            </div>
            {isSelected && (
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
            )}
          </button>
        );
      })}
    </div>
  );
}
