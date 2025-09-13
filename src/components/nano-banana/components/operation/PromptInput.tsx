import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("nano_banana.workspace.prompt_input");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {t("title")}
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
            ? t("placeholder_image_edit")
            : t("placeholder_text_to_image")
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
        {t("tip")}
      </div>
    </div>
  );
}
