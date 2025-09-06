"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

interface EmptyStateProps {
  locale: string;
}

export default function EmptyState({ locale }: EmptyStateProps) {
  const t = useTranslations("history");
  const router = useRouter();

  return (
    <div className="container py-20">
      <div className="flex flex-col items-center justify-center space-y-6 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500/10 to-cyan-500/10 flex items-center justify-center animate-pulse">
          <ImageIcon className="h-12 w-12 text-green-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">{t("empty.title")}</h2>
          <p className="text-muted-foreground max-w-sm">
            {t("empty.description")}
          </p>
        </div>
        <Button
          onClick={() => router.push(`/${locale}/#nanobanana`)}
          className="bg-gradient-to-r from-green-500 to-cyan-500 text-white hover:from-green-600 hover:to-cyan-600 shadow-lg shadow-green-500/25 hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {t("empty.action")}
        </Button>
      </div>
    </div>
  );
}
