import React from "react";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

interface AIDescriptionProps {
  description: string;
}

export default function AIDescription({ description }: AIDescriptionProps) {
  const t = useTranslations("nano_banana.workspace.ai_description");

  return (
    <div className="mx-6 mb-6 custom-card custom-card-info">
      <div className="flex items-start gap-2">
        <Sparkles className="h-4 w-4 text-blue-500 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
            {t("title")}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
