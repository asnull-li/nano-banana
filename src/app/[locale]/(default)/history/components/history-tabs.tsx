"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ImageIcon, Film, Sparkles, Clapperboard } from "lucide-react";
import { LucideIcon } from "lucide-react";

export type HistoryTabType = "nano-banana" | "veo3" | "sora2" | "upscaler";

interface HistoryTabsProps {
  activeTab: HistoryTabType;
  onTabChange: (tab: HistoryTabType) => void;
}

export default function HistoryTabs({
  activeTab,
  onTabChange,
}: HistoryTabsProps) {
  const t = useTranslations("history.tabs");

  const tabs: { id: HistoryTabType; label: string; icon: LucideIcon }[] = [
    { id: "nano-banana", label: t("nano_banana"), icon: ImageIcon },
    { id: "veo3", label: t("veo3"), icon: Film },
    { id: "sora2", label: t("sora2"), icon: Clapperboard },
    { id: "upscaler", label: t("upscaler"), icon: Sparkles },
  ];

  return (
    <div className="mb-6 sm:mb-8 border-b border-gray-200 dark:border-gray-800">
      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all relative",
                "hover:text-green-600 dark:hover:text-green-400",
                activeTab === tab.id
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{tab.label}</span>

              {/* Active indicator */}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-cyan-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
