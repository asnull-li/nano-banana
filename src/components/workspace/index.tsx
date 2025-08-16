"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ImageToImageMode from "./image-to-image";
import TextToImageMode from "./text-to-image";
import { Sparkles, Image, Zap } from "lucide-react";

export type WorkspaceMode = "img2img" | "text2img";

export interface WorkspaceProps {
  credits?: number;
  tier?: "free" | "pro" | "max";
  onGenerate?: (prompt: string, options: any) => Promise<void>;
}

export default function NanoBananaWorkspace({
  credits = 100,
  tier = "pro",
  onGenerate,
}: WorkspaceProps) {
  const [mode, setMode] = useState<WorkspaceMode>("img2img");
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="w-full space-y-4">
      {/* Mode Selector */}
      <div className="w-full">
        <div className="relative bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-1 shadow-inner">
          <div className="grid w-full grid-cols-2 gap-1">
            <button
              onClick={() => setMode("img2img")}
              className={`relative flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-medium transition-all duration-300 ${
                mode === "img2img"
                  ? "bg-gradient-to-r from-green-500 to-cyan-500 text-white shadow-lg shadow-green-500/25 scale-[1.02]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50"
              }`}
            >
              <Image className={`h-5 w-5 ${mode === "img2img" ? "text-white" : "text-green-500"}`} />
              <span className="text-sm font-semibold">Image to Image</span>
              {mode === "img2img" && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg opacity-20 blur-sm"></div>
              )}
            </button>
            
            <button
              onClick={() => setMode("text2img")}
              className={`relative flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-medium transition-all duration-300 ${
                mode === "text2img"
                  ? "bg-gradient-to-r from-green-500 to-cyan-500 text-white shadow-lg shadow-green-500/25 scale-[1.02]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50"
              }`}
            >
              <Sparkles className={`h-5 w-5 ${mode === "text2img" ? "text-white" : "text-cyan-500"}`} />
              <span className="text-sm font-semibold">Text to Image</span>
              {mode === "text2img" && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg opacity-20 blur-sm"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {mode === "img2img" ? (
          <ImageToImageMode
            onGenerate={onGenerate}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
          />
        ) : (
          <TextToImageMode
            onGenerate={onGenerate}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
          />
        )}
      </div>
    </div>
  );
}
