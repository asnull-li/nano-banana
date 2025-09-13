import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface PromptInputProps {
  mode: "image-to-image" | "text-to-image";
  prompt: string;
  onPromptChange: (prompt: string) => void;
  disabled?: boolean;
}

export default function PromptInput({
  mode,
  prompt,
  onPromptChange,
  disabled = false,
}: PromptInputProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          描述你的想法
        </h3>
        <span
          className={`text-xs transition-colors ${
            prompt.length > 4500
              ? "text-orange-500 dark:text-orange-400"
              : prompt.length > 4000
              ? "text-yellow-600 dark:text-yellow-500"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {prompt.length}/5000
        </span>
      </div>

      {/* 快速提示词 */}
      {/* <QuickPrompts
        mode={mode}
        prompt={prompt}
        onPromptChange={onPromptChange}
        disabled={disabled}
      /> */}

      {/* 输入框 */}
      <Textarea
        placeholder={
          mode === "image-to-image"
            ? "描述你想要的效果，可以包含风格、色彩、构图等细节..."
            : "详细描述你想要生成的图片，包含主体、场景、风格、色彩等..."
        }
        value={prompt}
        onChange={(e) => {
          if (e.target.value.length <= 5000) {
            onPromptChange(e.target.value);
          }
        }}
        className={`${
          mode === "text-to-image" ? "min-h-[300px]" : "min-h-[120px]"
        } max-h-[300px] resize-y bg-white/50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-700/60 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-blue-400/20 dark:focus:ring-blue-500/20 rounded-lg transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-700 dark:text-slate-200`}
        disabled={disabled}
      />
      <div className="text-xs text-slate-400 dark:text-slate-500">
        详细描述能获得更好效果
      </div>
    </div>
  );
}
