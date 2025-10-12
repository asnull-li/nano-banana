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
    <div className="bg-slate-200/60 dark:bg-slate-800/50 rounded-xl p-1 grid grid-cols-2 gap-1">
      {modes.map((modeOption) => {
        const isSelected = mode === modeOption.value;
        const IconComponent = modeOption.icon;

        return (
          <button
            key={modeOption.value}
            onClick={() => onModeChange(modeOption.value)}
            disabled={disabled}
            className={`
              px-4 py-2.5 rounded-lg transition-all duration-200
              ${
                isSelected
                  ? "bg-white dark:bg-slate-700/80 shadow-sm"
                  : "hover:bg-slate-300/40 dark:hover:bg-slate-700/40"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            <div className="flex items-center justify-center gap-2">
              <IconComponent
                className={`w-4 h-4 ${
                  isSelected
                    ? "text-slate-700 dark:text-white"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  isSelected
                    ? "text-slate-800 dark:text-white"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {modeOption.label}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
