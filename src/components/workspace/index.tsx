"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ImageToImageMode from "./image-to-image";
import TextToImageMode from "./text-to-image";
import { Sparkles, Image, Zap } from "lucide-react";
import { useTheme } from "next-themes";

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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="w-full space-y-4">
      {/* Mode Selector */}
      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as WorkspaceMode)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="img2img" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Image to Image
          </TabsTrigger>
          <TabsTrigger value="text2img" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Text to Image
          </TabsTrigger>
        </TabsList>

        <TabsContent value="img2img" className="mt-4">
          <ImageToImageMode
            onGenerate={onGenerate}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
          />
        </TabsContent>

        <TabsContent value="text2img" className="mt-4">
          <TextToImageMode
            onGenerate={onGenerate}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
