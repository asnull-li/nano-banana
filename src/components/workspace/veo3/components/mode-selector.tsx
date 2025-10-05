"use client";

import { Film, FileVideo } from "lucide-react";
import { cn } from "@/lib/utils";
import { Veo3TaskType } from "../types";

interface ModeSelectorProps {
  mode: Veo3TaskType;
  onModeChange: (mode: Veo3TaskType) => void;
  disabled?: boolean;
  texts?: any;
}

export default function ModeSelector({
  mode,
  onModeChange,
  disabled = false,
  texts = {},
}: ModeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="relative bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
        <div className="grid grid-cols-2">
          <button
            className={cn(
              "relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
              mode === "text-to-video"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
            onClick={() => onModeChange("text-to-video")}
            disabled={disabled}
          >
            <Film className="h-4 w-4 inline mr-2" />
            {texts.text_to_video || "Text to Video"}
          </button>

          <button
            className={cn(
              "relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
              mode === "image-to-video"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
            onClick={() => onModeChange("image-to-video")}
            disabled={disabled}
          >
            <FileVideo className="h-4 w-4 inline mr-2" />
            {texts.image_to_video || "Image to Video"}
          </button>
        </div>
      </div>
    </div>
  );
}
