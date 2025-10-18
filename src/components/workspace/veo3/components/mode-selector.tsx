"use client";

import { Film, FileVideo, Images } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeOption } from "../types";

interface ModeSelectorProps {
  mode: ModeOption;
  onModeChange: (mode: ModeOption) => void;
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
        <div className="grid grid-cols-3 gap-1">
          <button
            className={cn(
              "relative px-2 py-2 rounded-md text-xs font-medium transition-all duration-200",
              mode === "text-to-video"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
            onClick={() => onModeChange("text-to-video")}
            disabled={disabled}
          >
            <Film className="h-3.5 w-3.5 inline mr-1" />
            <span className="hidden sm:inline">{texts.text_to_video || "Text to Video"}</span>
            <span className="sm:hidden">Text</span>
          </button>

          <button
            className={cn(
              "relative px-2 py-2 rounded-md text-xs font-medium transition-all duration-200",
              mode === "image-to-video"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
            onClick={() => onModeChange("image-to-video")}
            disabled={disabled}
          >
            <FileVideo className="h-3.5 w-3.5 inline mr-1" />
            <span className="hidden sm:inline">{texts.image_to_video || "Image to Video"}</span>
            <span className="sm:hidden">Image</span>
          </button>

          <button
            className={cn(
              "relative px-2 py-2 rounded-md text-xs font-medium transition-all duration-200",
              mode === "reference-to-video"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
            onClick={() => onModeChange("reference-to-video")}
            disabled={disabled}
          >
            <Images className="h-3.5 w-3.5 inline mr-1" />
            <span className="hidden sm:inline">{texts.reference_to_video || "Reference to Video"}</span>
            <span className="sm:hidden">Ref</span>
          </button>
        </div>
      </div>
    </div>
  );
}
