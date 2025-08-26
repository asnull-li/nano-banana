"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import ImageToImageMode from "./image-to-image";
import TextToImageMode from "./text-to-image";
import { Sparkles, Image, Zap } from "lucide-react";
import { useCredits } from "@/hooks/use-credits";
import "./animations.css";

export type BananaWorkspaceMode = "image-to-image" | "text-to-image";

export interface BananaWorkspaceProps {
  onGenerate?: (prompt: string, options: any) => Promise<void>;
}

export default function BananaWorkspace({ onGenerate }: BananaWorkspaceProps) {
  const [mode, setMode] = useState<BananaWorkspaceMode>("image-to-image");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { credits, isLoading: creditsLoading } = useCredits();

  // 添加初始化动画
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialized(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div
        className={`space-y-6 transition-opacity duration-500 ${
          isInitialized ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Header with Credits */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
          <div>
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">
              Nano Banana Studio
            </h2>
            <p className="text-sm text-muted-foreground">
              AI-powered image generation
            </p>
          </div>
          <Badge
            variant="secondary"
            className="px-4 py-2 bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700"
          >
            <Zap className="w-4 h-4 mr-1 text-green-600" />
            <span className="font-semibold">
              {creditsLoading
                ? "..."
                : typeof credits === "object" && credits
                ? (credits as any).left_credits || 0
                : credits}
            </span>
            <span className="ml-1 text-sm opacity-70">Credits</span>
          </Badge>
        </div>

        {/* Mode Selector */}
        <div className="w-full">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-2">
            <div className="grid w-full grid-cols-2 gap-2">
              <button
                onClick={() => setMode("text-to-image")}
                className={`relative flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-medium transition-all ${
                  mode === "text-to-image"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                    : "bg-white dark:bg-gray-700 text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-gray-600"
                }`}
              >
                <Sparkles
                  className={`h-5 w-5 ${
                    mode === "text-to-image" ? "text-white" : "text-green-500"
                  }`}
                />
                <div>
                  <span className="block text-sm font-bold">Text to Image</span>
                  <span className="block text-xs mt-0.5 opacity-80">
                    {mode === "text-to-image" ? "Active" : "Create from text"}
                  </span>
                </div>
              </button>

              <button
                onClick={() => setMode("image-to-image")}
                className={`relative flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-medium transition-all ${
                  mode === "image-to-image"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                    : "bg-white dark:bg-gray-700 text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-gray-600"
                }`}
              >
                <Image
                  className={`h-5 w-5 ${
                    mode === "image-to-image" ? "text-white" : "text-green-500"
                  }`}
                />
                <div>
                  <span className="block text-sm font-bold">
                    Image to Image
                  </span>
                  <span className="block text-xs mt-0.5 opacity-80">
                    {mode === "image-to-image" ? "Active" : "Edit images"}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          {mode === "text-to-image" ? (
            <TextToImageMode
              onGenerate={onGenerate}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
            />
          ) : (
            <ImageToImageMode
              onGenerate={onGenerate}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
            />
          )}
        </div>
      </div>
    </div>
  );
}
