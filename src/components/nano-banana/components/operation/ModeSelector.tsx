import React from 'react';
import { Image as ImageIcon, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModeSelectorProps {
  mode: "image-to-image" | "text-to-image";
  onModeChange: (mode: "image-to-image" | "text-to-image") => void;
  disabled?: boolean;
}

export default function ModeSelector({ mode, onModeChange, disabled = false }: ModeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="relative bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
        <div className="grid grid-cols-2">
          <button
            className={cn(
              "relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
              mode === "image-to-image"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
            onClick={() => onModeChange("image-to-image")}
            disabled={disabled}
          >
            <ImageIcon className="h-4 w-4 inline mr-2" />
            图片编辑
          </button>
          
          <button
            className={cn(
              "relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
              mode === "text-to-image"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
            onClick={() => onModeChange("text-to-image")}
            disabled={disabled}
          >
            <Sparkles className="h-4 w-4 inline mr-2" />
            文生图
          </button>
        </div>
      </div>
    </div>
  );
}