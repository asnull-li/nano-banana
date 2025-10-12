"use client";

import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";
import { Sora2Model } from "../types";

interface ModelVersionSelectorProps {
  model: Sora2Model;
  onModelChange: (model: Sora2Model) => void;
  disabled?: boolean;
  texts?: any;
}

export default function ModelVersionSelector({
  model,
  onModelChange,
  disabled = false,
  texts = {},
}: ModelVersionSelectorProps) {
  const models: Array<{
    value: Sora2Model;
    label: string;
  }> = [
    {
      value: "sora2",
      label: texts.sora2 || "Sora 2",
    },
    {
      value: "sora2-pro",
      label: texts.sora2_pro || "Sora 2 Pro",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-emerald-500" />
        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {texts.label || "Model Version"}
        </Label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {models.map((modelOption) => {
          const isSelected = model === modelOption.value;

          return (
            <button
              key={modelOption.value}
              onClick={() => onModelChange(modelOption.value)}
              disabled={disabled}
              className={`
                p-3 rounded-lg border transition-all duration-200 relative
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
              <div className="flex items-center justify-center">
                <span
                  className={`text-sm font-semibold ${
                    isSelected
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {modelOption.label}
                </span>
              </div>
              {isSelected && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
