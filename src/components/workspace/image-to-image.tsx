"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

interface ImageToImageModeProps {
  onGenerate?: (prompt: string, options: any) => Promise<void>;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}

export default function ImageToImageMode({
  onGenerate,
  isGenerating,
  setIsGenerating,
}: ImageToImageModeProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [strength, setStrength] = useState([70]);
  const [quality, setQuality] = useState("standard");
  const [compareMode, setCompareMode] = useState(false);
  const [comparePosition, setComparePosition] = useState(50);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setGeneratedImage(null);
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
    if (!prompt || !uploadedImage) return;
    
    setIsGenerating(true);
    try {
      if (onGenerate) {
        await onGenerate(prompt, { strength: strength[0], quality, image: uploadedImage });
      }
      // Simulate generation
      setTimeout(() => {
        setGeneratedImage(uploadedImage); // In real app, this would be the generated image
        setCompareMode(true);
        setIsGenerating(false);
      }, 3000);
    } catch (error) {
      setIsGenerating(false);
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
                    setGeneratedImage(null);
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
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                {compareMode && generatedImage ? (
                  <div className="relative w-full h-full">
                    <img
                      src={uploadedImage}
                      alt="Original"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ width: `${comparePosition}%` }}
                    >
                      <img
                        src={generatedImage}
                        alt="Generated"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ minWidth: `${(100 / comparePosition) * 100}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={comparePosition}
                      onChange={(e) => setComparePosition(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                    />
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                      style={{ left: `${comparePosition}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white rounded-full p-1 shadow-lg">
                        <RefreshCw className="h-4 w-4" />
                      </div>
                    </div>
                    <Badge className="absolute top-2 left-2">Before</Badge>
                    <Badge className="absolute top-2 right-2">After</Badge>
                  </div>
                ) : (
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}

            {uploadedImage && (
              <div className="space-y-3">
                <Label>Edit Strength</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={strength}
                    onValueChange={setStrength}
                    min={0}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{strength[0]}%</span>
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

                {generatedImage && (
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
              <Label>Quality Mode</Label>
              <RadioGroup value={quality} onValueChange={setQuality}>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard" className="font-normal cursor-pointer">
                      Standard
                      <Badge variant="outline" className="ml-2 text-xs">
                        2 credits
                      </Badge>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pro" id="pro" />
                    <Label htmlFor="pro" className="font-normal cursor-pointer">
                      Pro
                      <Badge variant="outline" className="ml-2 text-xs">
                        12 credits
                      </Badge>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="max" id="max" />
                    <Label htmlFor="max" className="font-normal cursor-pointer">
                      Max
                      <Badge variant="outline" className="ml-2 text-xs">
                        24 credits
                      </Badge>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:scale-105 transition-all duration-300"
                onClick={handleGenerate}
                disabled={!uploadedImage || !prompt || isGenerating}
              >
                {isGenerating ? (
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
              {generatedImage && (
                <Button variant="outline" size="icon" className="border-green-500/20 hover:border-green-500/40 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10">
                  <Download className="h-4 w-4 text-green-500" />
                </Button>
              )}
            </div>

            {isGenerating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Processing</span>
                  <span className="font-medium">60%</span>
                </div>
                <div className="h-2 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-cyan-500 transition-all duration-300 shadow-lg shadow-green-500/50"
                    style={{ width: "60%" }}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}