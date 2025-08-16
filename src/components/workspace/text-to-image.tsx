"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Wand2,
  Download,
  Loader2,
  Sparkles,
  RefreshCw,
  Copy,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TextToImageModeProps {
  onGenerate?: (prompt: string, options: any) => Promise<void>;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}

export default function TextToImageMode({
  onGenerate,
  isGenerating,
  setIsGenerating,
}: TextToImageModeProps) {
  const [prompt, setPrompt] = useState("");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [quality, setQuality] = useState("standard");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [style, setStyle] = useState("photo");

  const handleGenerate = async () => {
    if (!prompt) return;
    
    setIsGenerating(true);
    try {
      if (onGenerate) {
        await onGenerate(prompt, { quality, aspectRatio, style });
      }
      // Simulate generation
      setTimeout(() => {
        setGeneratedImages(["/api/placeholder/512/512"]);
        setIsGenerating(false);
      }, 3000);
    } catch (error) {
      setIsGenerating(false);
    }
  };

  const inspirations = [
    "Cyberpunk city at night with neon lights",
    "Oil painting of mountains at sunset",
    "Anime style character with blue hair",
    "Abstract colorful geometric art",
    "Realistic portrait of a warrior",
    "Underwater fantasy world with glowing creatures",
  ];

  const stylePresets = [
    { value: "photo", label: "Photo", icon: "📸" },
    { value: "art", label: "Art", icon: "🎨" },
    { value: "anime", label: "Anime", icon: "✨" },
    { value: "3d", label: "3D", icon: "🎮" },
  ];

  const aspectRatios = [
    { value: "1:1", label: "Square" },
    { value: "16:9", label: "Landscape" },
    { value: "9:16", label: "Portrait" },
    { value: "4:3", label: "Classic" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel - Create Mode */}
      <div className="space-y-4">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent">Create Mode</h3>
            </div>

            <div className="space-y-3">
              <Label>Describe your vision</Label>
              <Textarea
                placeholder="A futuristic city with flying cars at sunset..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[150px] resize-none"
              />
            </div>

            <div className="space-y-3">
              <Label>Aspect Ratio</Label>
              <div className="grid grid-cols-4 gap-2">
                {aspectRatios.map((ratio) => (
                  <Button
                    key={ratio.value}
                    variant={aspectRatio === ratio.value ? "default" : "outline"}
                    size="sm"
                    className={aspectRatio === ratio.value ? "bg-gradient-to-r from-green-500 to-cyan-500 text-white border-0" : "border-green-500/20 hover:border-green-500/40 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10"}
                    onClick={() => setAspectRatio(ratio.value)}
                  >
                    {ratio.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Style Preset</Label>
              <div className="grid grid-cols-4 gap-2">
                {stylePresets.map((preset) => (
                  <Button
                    key={preset.value}
                    variant={style === preset.value ? "default" : "outline"}
                    size="sm"
                    className={`flex flex-col gap-1 h-auto py-2 ${style === preset.value ? "bg-gradient-to-r from-green-500 to-cyan-500 text-white border-0" : "border-green-500/20 hover:border-green-500/40 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10"}`}
                    onClick={() => setStyle(preset.value)}
                  >
                    <span className="text-lg">{preset.icon}</span>
                    <span className="text-xs">{preset.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {generatedImages.length > 0 && (
              <div className="space-y-3">
                <Label>Generated Result</Label>
                <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                  <img
                    src={generatedImages[selectedImage]}
                    alt="Generated"
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-gradient-to-r from-green-500/90 to-cyan-500/90 text-white border-0">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Generated
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 border-green-500/20 hover:border-green-500/40 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10">
                    <RefreshCw className="h-4 w-4 mr-2 text-green-500" />
                    Regenerate
                  </Button>
                  <Button size="sm" variant="outline" className="border-green-500/20 hover:border-green-500/40 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10">
                    <Download className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button size="sm" variant="outline" className="border-green-500/20 hover:border-green-500/40 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10">
                    <Share2 className="h-4 w-4 text-cyan-500" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Right Panel - AI Assistant */}
      <div className="space-y-4">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-500" />
              <h3 className="text-lg font-semibold bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent">AI Assistant</h3>
            </div>

            <p className="text-sm text-muted-foreground">
              I'll help you create amazing images from text! Try these inspirations:
            </p>

            <div className="space-y-2">
              <Label>💡 Inspiration</Label>
              <div className="space-y-2">
                {inspirations.map((inspiration, idx) => (
                  <Button
                    key={idx}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2 px-3 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10"
                    onClick={() => setPrompt(inspiration)}
                  >
                    <span className="line-clamp-2 text-sm">{inspiration}</span>
                  </Button>
                ))}
              </div>
            </div>

            {generatedImages.length > 0 && (
              <div className="space-y-2">
                <Label>Recent Creations</Label>
                <div className="grid grid-cols-4 gap-2">
                  {generatedImages.map((img, idx) => (
                    <button
                      key={idx}
                      className={cn(
                        "relative aspect-square rounded-md overflow-hidden border-2 transition-colors",
                        selectedImage === idx
                          ? "border-primary"
                          : "border-transparent"
                      )}
                      onClick={() => setSelectedImage(idx)}
                    >
                      <img
                        src={img}
                        alt={`Generated ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                  <Button
                    variant="outline"
                    className="aspect-square border-green-500/20 hover:border-green-500/40 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10"
                    onClick={() => {
                      // Add new generation
                    }}
                  >
                    <span className="text-2xl">➕</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Quality Mode</Label>
              <RadioGroup value={quality} onValueChange={setQuality}>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="standard" id="t2i-standard" />
                    <Label htmlFor="t2i-standard" className="flex-1 font-normal cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span>Standard</span>
                        <Badge variant="outline" className="text-xs">
                          2 credits
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Good quality, fast generation
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pro" id="t2i-pro" />
                    <Label htmlFor="t2i-pro" className="flex-1 font-normal cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span>Pro</span>
                        <Badge variant="outline" className="text-xs">
                          12 credits
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        High quality, more details
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="max" id="t2i-max" />
                    <Label htmlFor="t2i-max" className="flex-1 font-normal cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span>Max</span>
                        <Badge variant="outline" className="text-xs">
                          24 credits
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Best quality, maximum resolution
                      </span>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:scale-105 transition-all duration-300"
              size="lg"
              onClick={handleGenerate}
              disabled={!prompt || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Create
                </>
              )}
            </Button>

            {isGenerating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Generating</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="h-2 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-cyan-500 transition-all duration-300 shadow-lg shadow-green-500/50"
                    style={{ width: "45%" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Instant generation with Pro tier ⚡
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Copy className="h-3 w-3" />
              <span>Prompt copied to clipboard</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}