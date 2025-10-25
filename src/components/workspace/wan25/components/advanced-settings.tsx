"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Settings2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface AdvancedSettingsProps {
  negativePrompt: string;
  onNegativePromptChange: (value: string) => void;
  seed?: number;
  onSeedChange: (value: number | undefined) => void;
  disabled?: boolean;
  texts?: any;
}

export default function AdvancedSettings({
  negativePrompt,
  onNegativePromptChange,
  seed,
  onSeedChange,
  disabled = false,
  texts = {},
}: AdvancedSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      onSeedChange(undefined);
    } else {
      const num = parseInt(value, 10);
      if (!isNaN(num)) {
        onSeedChange(num);
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* 折叠按钮 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={disabled}
        className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200/80 dark:border-slate-600/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {texts.title || "Advanced Settings"}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        )}
      </button>

      {/* 折叠内容 */}
      {isExpanded && (
        <div className="space-y-4 p-4 rounded-lg bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/50">
          {/* Negative Prompt */}
          <div className="space-y-2">
            <Label
              htmlFor="negativePrompt"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {texts.negative_prompt_label || "Negative Prompt"}
            </Label>
            <Textarea
              id="negativePrompt"
              value={negativePrompt}
              onChange={(e) => onNegativePromptChange(e.target.value)}
              disabled={disabled}
              placeholder={
                texts.negative_prompt_placeholder ||
                "Describe what you don't want in the video..."
              }
              className="min-h-[80px] resize-none text-sm"
              maxLength={500}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {texts.negative_prompt_helper ||
                "Optional: Describe content to avoid in the generated video"}
            </p>
          </div>

          {/* Seed */}
          <div className="space-y-2">
            <Label
              htmlFor="seed"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {texts.seed_label || "Seed"}
            </Label>
            <Input
              id="seed"
              type="number"
              value={seed ?? ""}
              onChange={handleSeedChange}
              disabled={disabled}
              placeholder={texts.seed_placeholder || "Random (leave empty)"}
              className="text-sm"
              min={0}
              max={2147483647}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {texts.seed_helper ||
                "Optional: Use a specific seed for reproducible results"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
