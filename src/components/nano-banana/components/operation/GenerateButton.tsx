import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wand2, Loader2, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface GenerateButtonProps {
  canSubmit: boolean;
  isProcessing: boolean;
  creditsPerImage: number;
  onSubmit: () => void;
}

export default function GenerateButton({
  canSubmit,
  isProcessing,
  creditsPerImage,
  onSubmit,
}: GenerateButtonProps) {
  return (
    <div className="p-6 pt-4">
      <Button
        className={cn(
          "w-full h-12 text-base font-bold",
          "bg-gradient-to-r from-green-500 to-cyan-500",
          "hover:from-green-600 hover:to-cyan-600",
          "text-white shadow-lg shadow-green-500/25",
          "transition-all duration-300",
          canSubmit &&
            !isProcessing &&
            "hover:shadow-xl hover:shadow-green-500/30 hover:scale-[1.02]",
          (!canSubmit || isProcessing) && "opacity-60 cursor-not-allowed"
        )}
        onClick={onSubmit}
        disabled={!canSubmit || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            生成中...
          </>
        ) : (
          <>
            <Wand2 className="h-5 w-5 mr-2" />
            开始创作
            <Badge className="ml-2 bg-white/20 text-white border-0">
              <Coins className="h-3 w-3 mr-1" />
              {creditsPerImage}
            </Badge>
          </>
        )}
      </Button>
    </div>
  );
}
