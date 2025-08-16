"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useFluxAPI } from "@/hooks/use-flux-api";
import { toast } from "sonner";
import {
  Upload,
  Wand2,
  Download,
  RefreshCw,
  Loader2,
  Image as ImageIcon,
  Sparkles,
  Sun,
  Palette,
  Eraser,
  Camera,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Compare } from "@/components/ui/compare";
import { downloadImage, generateImageFilename } from "@/lib/download-utils";

interface ImageToImageModeProps {
  onGenerate?: (prompt: string, options: any) => Promise<void>;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}

export default function ImageToImageMode({
  onGenerate,
  isGenerating: externalIsGenerating,
  setIsGenerating: setExternalIsGenerating,
}: ImageToImageModeProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [quality, setQuality] = useState("flux-kontext-pro");
  const [compareMode, setCompareMode] = useState(false);
  const [comparePosition, setComparePosition] = useState(50);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const { uploadImage, editImage, isGenerating, progress } = useFluxAPI();

  const handleDownload = async (imageUrl: string, customFileName?: string) => {
    await downloadImage(imageUrl, {
      filename: customFileName || `${generateImageFilename('nano-banana', 'edited')}.jpg`,
      onStart: () => setIsDownloading(true),
      onComplete: () => setIsDownloading(false),
    });
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setGeneratedImages([]);
        setCompareMode(false);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
  });

  const handleGenerate = async () => {
    if (!prompt || !uploadedFile) {
      toast.error("Please upload an image and enter a prompt");
      return;
    }
    
    setExternalIsGenerating(true);
    try {
      // Upload image to R2 first
      let imageUrl = uploadedImageUrl;
      if (!imageUrl && uploadedFile) {
        toast.info("Uploading image...");
        imageUrl = await uploadImage(uploadedFile);
        setUploadedImageUrl(imageUrl);
      }

      if (!imageUrl) {
        throw new Error("Failed to upload image");
      }

      // Edit image with Flux API
      const modelMap: Record<string, "flux-kontext-pro" | "flux-kontext-max"> = {
        "flux-kontext-pro": "flux-kontext-pro",
        "flux-kontext-max": "flux-kontext-max",
      };

      const result = await editImage({
        prompt,
        imageUrl,
        model: modelMap[quality] || "flux-kontext-pro",
      });

      // Handle results
      if (result && result.length > 0) {
        const imageUrls = result.map((item: any) => item.image_url);
        setGeneratedImages(imageUrls);
        setCompareMode(true);
        toast.success("Image edited successfully!");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to edit image");
    } finally {
      setExternalIsGenerating(false);
    }
  };

  const quickActions = [
    { icon: Sun, label: "Change lighting", prompt: "Change to golden hour lighting", color: "from-yellow-500 to-orange-500" },
    { icon: Palette, label: "Style transfer", prompt: "Convert to oil painting style", color: "from-purple-500 to-pink-500" },
    { icon: Eraser, label: "Remove background", prompt: "Remove background, keep subject", color: "from-red-500 to-rose-500" },
    { icon: Camera, label: "Color grading", prompt: "Apply cinematic color grading", color: "from-blue-500 to-indigo-500" },
  ];

  const sampleImages = [
    "👤", "🏔️", "🏙️", "🐱"
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel - Upload & Preview */}
      <div className="space-y-4">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-green-500" />
                Edit Mode
              </h3>
              {uploadedImage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setUploadedImage(null);
                    setGeneratedImages([]);
                    setCompareMode(false);
                  }}
                >
                  Clear
                </Button>
              )}
            </div>

            {!uploadedImage ? (
              <>
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 relative overflow-hidden group",
                    isDragActive
                      ? "border-green-500 bg-gradient-to-br from-green-500/10 to-cyan-500/10"
                      : "border-green-500/30 hover:border-green-500/50 hover:bg-gradient-to-br hover:from-green-500/5 hover:to-cyan-500/5"
                  )}
                >
                  <input {...getInputProps()} />
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Upload className="h-12 w-12 mx-auto mb-4 text-green-500 relative z-10" />
                  <p className="text-lg font-medium mb-1">Upload image</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop your image here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, WEBP up to 20MB
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Sample images:</p>
                  <div className="flex gap-2">
                    {sampleImages.map((emoji, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="lg"
                        className="h-16 w-16 text-2xl border-green-500/20 hover:border-green-500/40 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10 transition-all duration-300"
                        onClick={() => {
                          // In real app, load sample image
                          setUploadedImage(`sample-${idx}`);
                        }}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {compareMode && generatedImages.length > 0 ? (
                  <div className="space-y-4">
                    <Compare
                      firstImage={uploadedImage}
                      secondImage={generatedImages[0]}
                      className="w-full aspect-square rounded-lg overflow-hidden"
                      slideMode="drag"
                      showHandlebar={true}
                      initialSliderPercentage={50}
                      firstImageLabel="Original"
                      secondImageLabel="AI Edited"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setGeneratedImages([]);
                            setCompareMode(false);
                          }}
                          className="border-orange-500/20 hover:border-orange-500/40 hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-red-500/10"
                        >
                          <RefreshCw className="h-4 w-4 mr-1 text-orange-500" />
                          New Edit
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(generatedImages[0])}
                        disabled={isDownloading}
                        className="border-blue-500/20 hover:border-blue-500/40 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 text-blue-500 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-1 text-blue-500" />
                            Download
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </>
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

            {uploadedImage ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Image uploaded! What would you like to change?
                </p>

                <div className="space-y-2">
                  <Label>Quick Actions</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="justify-start border-green-500/20 hover:border-green-500/40 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10 transition-all duration-300"
                        onClick={() => setPrompt(action.prompt)}
                      >
                        <action.icon className="h-4 w-4 mr-2 text-green-500" />
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {generatedImages.length > 0 && (
                  <div className="space-y-2">
                    <Label>Recent Edits</Label>
                    <div className="flex gap-2">
                      {["🌅", "🎨", "🌙", "➕"].map((emoji, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="h-12 w-12 text-lg border-green-500/20 hover:border-green-500/40 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10"
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Ready to transform your image! Upload an image to get started.
              </p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <Textarea
              placeholder="Describe what you want to change..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={!uploadedImage}
            />

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                Quality: 
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {quality === "flux-kontext-pro" ? "Pro" : "Max"}
                </span>
                <span className="text-yellow-500">⚡</span>
                <span className="text-sm font-medium">
                  {quality === "flux-kontext-pro" ? "12" : "24"}
                </span>
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
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        quality === "flux-kontext-pro" 
                          ? "border-green-500 bg-green-500" 
                          : "border-slate-300 dark:border-slate-600"
                      }`}>
                        {quality === "flux-kontext-pro" && (
                          <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5"></div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Pro</span>
                          <span className="text-yellow-500 text-sm">⚡ 12</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Ideal for most scenarios, precise editing
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
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        quality === "flux-kontext-max" 
                          ? "border-green-500 bg-green-500" 
                          : "border-slate-300 dark:border-slate-600"
                      }`}>
                        {quality === "flux-kontext-max" && (
                          <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5"></div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Max</span>
                          <span className="text-yellow-500 text-sm">⚡ 24</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Ultimate quality, perfect details
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:scale-105 transition-all duration-300"
              onClick={handleGenerate}
              disabled={!uploadedImage || !prompt || isGenerating || externalIsGenerating}
            >
              {(isGenerating || externalIsGenerating) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Transforming...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Transform
                </>
              )}
            </Button>

            {(isGenerating || progress > 0) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Processing</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="h-2 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-cyan-500 transition-all duration-300 shadow-lg shadow-green-500/50"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  This may take 1-2 minutes...
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}