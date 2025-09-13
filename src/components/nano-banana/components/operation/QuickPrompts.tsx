import React from "react";
import { Button } from "@/components/ui/button";
import { Lightbulb, Palette, Zap, Camera, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

interface QuickPromptsProps {
  mode: "image-to-image" | "text-to-image";
  prompt: string;
  onPromptChange: (prompt: string) => void;
  disabled?: boolean;
}

export default function QuickPrompts({
  mode,
  prompt,
  onPromptChange,
  disabled = false,
}: QuickPromptsProps) {
  const t = useTranslations("nano_banana.workspace.quick_prompts");

  const quickPrompts =
    mode === "image-to-image"
      ? [
          {
            icon: Lightbulb,
            label: t("image_mode.enhance_details"),
            prompt: t("image_mode.enhance_details_prompt"),
          },
          {
            icon: Palette,
            label: t("image_mode.art_style"),
            prompt: t("image_mode.art_style_prompt"),
          },
          {
            icon: Zap,
            label: t("image_mode.anime_style"),
            prompt: t("image_mode.anime_style_prompt"),
          },
          {
            icon: Camera,
            label: t("image_mode.realistic_photo"),
            prompt: t("image_mode.realistic_photo_prompt"),
          },
        ]
      : [
          {
            icon: Palette,
            label: t("text_mode.art_creation"),
            prompt: t("text_mode.art_creation_prompt"),
          },
          {
            icon: Camera,
            label: t("text_mode.realistic_style"),
            prompt: t("text_mode.realistic_style_prompt"),
          },
          {
            icon: Sparkles,
            label: t("text_mode.sci_fi"),
            prompt: t("text_mode.sci_fi_prompt"),
          },
          {
            icon: Lightbulb,
            label: t("text_mode.creative_design"),
            prompt: t("text_mode.creative_design_prompt"),
          },
        ];

  return (
    <div className="grid grid-cols-2 gap-1">
      {quickPrompts.map((item, idx) => (
        <Button
          key={idx}
          variant="outline"
          size="sm"
          className="h-auto py-2 px-2 justify-start text-xs border-slate-200 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-950/20"
          onClick={() =>
            onPromptChange(prompt ? `${prompt}, ${item.prompt}` : item.prompt)
          }
          disabled={disabled}
        >
          <item.icon className="h-3 w-3 mr-1 text-green-500" />
          <span className="truncate">{item.label}</span>
        </Button>
      ))}
    </div>
  );
}
