"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useFluxAPI } from "@/hooks/use-flux-api";
import { toast } from "sonner";
import {
  Wand2,
  Download,
  Loader2,
  Sparkles,
  RefreshCw,
  Share2,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Monitor,
  Maximize2,
  Eye,
  Lock,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadImage, generateImageFilename } from "@/lib/download-utils";
import { useCredits } from "@/hooks/use-credits";
import { useAppContext } from "@/contexts/app";
import { useTranslations } from "next-intl";

interface TextToImageModeProps {
  onGenerate?: (prompt: string, options: any) => Promise<void>;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}

export default function TextToImageMode({
  onGenerate,
  isGenerating: externalIsGenerating,
  setIsGenerating: setExternalIsGenerating,
}: TextToImageModeProps) {
  const [prompt, setPrompt] = useState("");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [quality, setQuality] = useState("flux-kontext-pro");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasStartedGeneration, setHasStartedGeneration] = useState(false);

  const { generateImage, isGenerating, progress } = useFluxAPI();
  const {
    credits,
    isLoading: creditsLoading,
    validateCredits,
    consumeCredits,
    refreshCredits,
    CREDITS_COST,
  } = useCredits();
  const { user, setShowSignModal } = useAppContext();
  const t = useTranslations();

  const handleDownload = async (imageUrl: string, customFileName?: string) => {
    await downloadImage(imageUrl, {
      filename:
        customFileName ||
        `${generateImageFilename("nano-banana", "generated")}.jpg`,
      onStart: () => setIsDownloading(true),
      onComplete: () => setIsDownloading(false),
    });
  };

  const handleGenerate = async () => {
    if (!prompt) {
      toast.error("Please enter a prompt");
      return;
    }

    // Validate credits before generation
    const qualityType = quality === "flux-kontext-max" ? "max" : "pro";
    if (!validateCredits(qualityType)) {
      return;
    }

    setHasStartedGeneration(true);
    setExternalIsGenerating(true);

    try {
      // Map aspect ratio to size
      const sizeMap: Record<string, string> = {
        "1:1": "1024x1024",
        "16:9": "1920x1080",
        "9:16": "1080x1920",
        "4:3": "1024x768",
      };

      const modelMap: Record<string, "flux-kontext-pro" | "flux-kontext-max"> =
        {
          "flux-kontext-pro": "flux-kontext-pro",
          "flux-kontext-max": "flux-kontext-max",
        };

      const result = await generateImage({
        prompt,
        model: modelMap[quality] || "flux-kontext-pro",
        size: sizeMap[aspectRatio] || "1024x1024",
        count: 1,
      });

      // Handle results
      if (result && result.length > 0) {
        const imageUrls = result.map((item: any) => item.image_url);
        setGeneratedImages(imageUrls);

        toast.success(
          `Image generated successfully! ${CREDITS_COST[qualityType]} credits deducted.`
        );

        // Refresh user info to get exact server state (including credits)
        setTimeout(() => refreshCredits(), 1000);
      }
    } catch (error) {
      console.error("Generation error:", error);
      // Don't show toast for credits required error as it's already handled
      if (error instanceof Error && error.message !== "Credits required") {
        toast.error(error.message || "Failed to generate image");
      }
    } finally {
      setExternalIsGenerating(false);
    }
  };

  const inspirations = t.raw(
    "workspace.text_to_image.inspirations"
  ) as string[];

  const aspectRatios = [
    {
      value: "1:1",
      label: "1:1",
      description: t("workspace.text_to_image.aspect_ratios.square"),
      icon: Square,
      iconClass: "w-5 h-5",
    },
    {
      value: "16:9",
      label: "16:9",
      description: t("workspace.text_to_image.aspect_ratios.landscape"),
      icon: RectangleHorizontal,
      iconClass: "w-6 h-4",
    },
    {
      value: "9:16",
      label: "9:16",
      description: t("workspace.text_to_image.aspect_ratios.portrait"),
      icon: RectangleVertical,
      iconClass: "w-4 h-6",
    },
    {
      value: "4:3",
      label: "4:3",
      description: t("workspace.text_to_image.aspect_ratios.classic"),
      icon: Monitor,
      iconClass: "w-5 h-4",
    },
  ];

  return (
    <div className="space-y-4">
      {/* 未登录提示 */}
      {!user && (
        <Card className="p-4 bg-gradient-to-r from-green-500/10 to-cyan-500/10 border-green-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">{t("workspace.sign_in_prompt")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("workspace.sign_in_description")}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white border-0"
              onClick={() => setShowSignModal(true)}
            >
              {t("workspace.sign_in_button")}
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Create Mode */}
        <div className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-semibold bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent">
                  {t("workspace.text_to_image.title")}
                </h3>
              </div>

              <div className="space-y-3">
                <Label>{t("workspace.text_to_image.prompt_label")}</Label>
                <Textarea
                  placeholder={t("workspace.text_to_image.prompt_placeholder")}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[150px] resize-none"
                />
              </div>

              <div className="space-y-3">
                <Label>{t("workspace.text_to_image.aspect_ratio_label")}</Label>
                <div className="grid grid-cols-2 gap-3">
                  {aspectRatios.map((ratio) => {
                    const IconComponent = ratio.icon;
                    return (
                      <Button
                        key={ratio.value}
                        variant={
                          aspectRatio === ratio.value ? "default" : "outline"
                        }
                        className={`flex items-center gap-3 h-auto py-3 px-4 ${
                          aspectRatio === ratio.value
                            ? "bg-gradient-to-r from-green-500 to-cyan-500 text-white border-0"
                            : "border-green-500/20 hover:border-green-500/40 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10"
                        }`}
                        onClick={() => setAspectRatio(ratio.value)}
                      >
                        <IconComponent
                          className={`${ratio.iconClass} ${
                            aspectRatio === ratio.value
                              ? "text-white"
                              : "text-green-500"
                          }`}
                        />
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{ratio.label}</span>
                          <span className="text-xs opacity-70">
                            {ratio.description}
                          </span>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  {t("workspace.text_to_image.quality_label")}:
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {quality === "flux-kontext-pro"
                      ? t("workspace.text_to_image.quality_pro")
                      : t("workspace.text_to_image.quality_max")}
                  </span>
                  <span className="text-yellow-500">⚡</span>
                  <span className="text-sm font-medium">
                    {quality === "flux-kontext-pro"
                      ? CREDITS_COST.pro
                      : CREDITS_COST.max}{" "}
                    {t("workspace.text_to_image.credits")}
                  </span>
                  {!creditsLoading && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({credits.left_credits}{" "}
                      {t("workspace.text_to_image.credits_left")})
                    </span>
                  )}
                </Label>

                <div className="space-y-2">
                  <button
                    onClick={() => setQuality("flux-kontext-pro")}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      quality === "flux-kontext-pro"
                        ? "border-green-500 bg-green-500/10 shadow-md"
                        : "border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            quality === "flux-kontext-pro"
                              ? "border-green-500 bg-green-500"
                              : "border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          {quality === "flux-kontext-pro" && (
                            <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5"></div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {t("workspace.text_to_image.quality_pro")}
                            </span>
                            <span className="text-yellow-500 text-sm">
                              ⚡ {CREDITS_COST.pro}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {t("workspace.text_to_image.quality_pro_desc")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setQuality("flux-kontext-max")}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      quality === "flux-kontext-max"
                        ? "border-green-500 bg-green-500/10 shadow-md"
                        : "border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            quality === "flux-kontext-max"
                              ? "border-green-500 bg-green-500"
                              : "border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          {quality === "flux-kontext-max" && (
                            <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5"></div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {t("workspace.text_to_image.quality_max")}
                            </span>
                            <span className="text-yellow-500 text-sm">
                              ⚡ {CREDITS_COST.max}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {t("workspace.text_to_image.quality_max_desc")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:scale-105 transition-all duration-300"
                size="lg"
                onClick={handleGenerate}
                disabled={!prompt || isGenerating || externalIsGenerating}
              >
                {isGenerating || externalIsGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("workspace.text_to_image.generating_button")}
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    {t("workspace.text_to_image.generate_button")}
                  </>
                )}
              </Button>

              {(isGenerating || progress > 0) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("workspace.text_to_image.generating_button").replace(
                        "...",
                        ""
                      )}
                    </span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="h-2 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-cyan-500 transition-all duration-300 shadow-lg shadow-green-500/50"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {t("workspace.text_to_image.this_may_take")}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Panel - Results & Assistant */}
        <div className="space-y-4">
          {/* Generated Results Section */}
          {hasStartedGeneration ? (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent">
                      {t("workspace.text_to_image.generated_result")}
                    </h3>
                  </div>
                  <Badge className="bg-gradient-to-r from-green-500/90 to-cyan-500/90 text-white border-0">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {t("workspace.text_to_image.ai_generated")}
                  </Badge>
                </div>

                {/* Main Image Display */}
                <div className="relative aspect-square bg-muted rounded-lg overflow-hidden group">
                  {(isGenerating || externalIsGenerating) &&
                  generatedImages.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                      <div className="text-center">
                        <Loader2 className="h-12 w-12 mx-auto mb-4 text-green-500 animate-spin" />
                        <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                          {t("workspace.text_to_image.generating_text")}
                        </p>
                        <div className="w-32 h-2 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-full overflow-hidden mx-auto">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-cyan-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {progress}%{" "}
                          {t("workspace.text_to_image.complete_text")}
                        </p>
                      </div>
                    </div>
                  ) : generatedImages.length > 0 ? (
                    <>
                      <img
                        src={generatedImages[selectedImage]}
                        alt="Generated"
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setIsFullscreen(true)}
                      />
                      {/* Hover overlay with view action */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setIsFullscreen(true)}
                          className="bg-white/90 hover:bg-white text-black"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {t("workspace.text_to_image.view_full_size")}
                        </Button>
                      </div>
                    </>
                  ) : null}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-green-500/20 hover:border-green-500/40 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10"
                    onClick={handleGenerate}
                    disabled={!prompt || isGenerating || externalIsGenerating}
                  >
                    <RefreshCw className="h-4 w-4 mr-2 text-green-500" />
                    {t("workspace.text_to_image.regenerate_button")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleDownload(generatedImages[selectedImage])
                    }
                    disabled={isDownloading}
                    className="border-green-500/20 hover:border-green-500/40 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 text-green-500 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 text-green-500" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-500/20 hover:border-green-500/40 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10"
                  >
                    <Share2 className="h-4 w-4 text-cyan-500" />
                  </Button>
                </div>

                {/* Image Gallery */}
                {generatedImages.length > 1 && (
                  <div className="space-y-2">
                    <Label>
                      {t("workspace.text_to_image.all_generated_images")}
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                      {generatedImages.map((img, idx) => (
                        <button
                          key={idx}
                          className={cn(
                            "relative aspect-square rounded-md overflow-hidden border-2 transition-all duration-200",
                            selectedImage === idx
                              ? "border-green-500 shadow-md shadow-green-500/25"
                              : "border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600"
                          )}
                          onClick={() => setSelectedImage(idx)}
                        >
                          <img
                            src={img}
                            alt={`Generated ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {selectedImage === idx && (
                            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  {idx + 1}
                                </span>
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            /* AI Assistant Section - Show when no images */
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-cyan-500" />
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent">
                    {t("workspace.text_to_image.ai_assistant_title")}
                  </h3>
                </div>

                <p className="text-sm text-muted-foreground">
                  {t("workspace.text_to_image.ai_assistant_desc")}
                </p>

                <div className="space-y-2">
                  <Label>💡 {t("workspace.text_to_image.inspiration")}</Label>
                  <div className="space-y-2">
                    {inspirations.map((inspiration, idx) => (
                      <Button
                        key={idx}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left h-auto py-2 px-3 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10"
                        onClick={() => setPrompt(inspiration)}
                      >
                        <span className="line-clamp-2 text-sm">
                          {inspiration}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Click the download button and then right-click to save
              </p>
            </Card>
          )}
        </div>

        {/* Fullscreen Modal */}
        {isFullscreen && generatedImages.length > 0 && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setIsFullscreen(false)}
          >
            <div className="relative max-w-[90vw] max-h-[90vh]">
              {/* Close button */}
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-black"
                onClick={() => setIsFullscreen(false)}
              >
                ✕
              </Button>

              {/* Full size image */}
              <img
                src={generatedImages[selectedImage]}
                alt="Generated (Full Size)"
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Navigation for multiple images */}
              {generatedImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-white/90 rounded-lg p-2">
                  {generatedImages.map((_, idx) => (
                    <button
                      key={idx}
                      className={cn(
                        "w-3 h-3 rounded-full transition-colors",
                        selectedImage === idx
                          ? "bg-green-500"
                          : "bg-gray-300 hover:bg-gray-400"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(idx);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
