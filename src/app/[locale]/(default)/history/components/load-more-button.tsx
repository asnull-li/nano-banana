"use client";

import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

interface LoadMoreButtonProps {
  isLoading: boolean;
  hasMore: boolean;
  tasksCount: number;
  onLoadMore: () => void;
}

export default function LoadMoreButton({
  isLoading,
  hasMore,
  tasksCount,
  onLoadMore,
}: LoadMoreButtonProps) {
  const t = useTranslations("history");

  if (!hasMore && tasksCount > 0) {
    return (
      <div className="mt-10 text-center text-muted-foreground">
        {t("no_more")}
      </div>
    );
  }

  if (!hasMore) {
    return null;
  }

  return (
    <div className="mt-10 flex justify-center">
      <Button
        onClick={onLoadMore}
        disabled={isLoading}
        className="bg-gradient-to-r from-green-500 to-cyan-500 text-white hover:from-green-600 hover:to-cyan-600 shadow-lg shadow-green-500/25 hover:shadow-xl hover:scale-105 transition-all duration-300"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {t("loading")}
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4 mr-2" />
            {t("load_more")}
          </>
        )}
      </Button>
    </div>
  );
}