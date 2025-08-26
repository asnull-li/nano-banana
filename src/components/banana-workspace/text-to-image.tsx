"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Sparkles,
  Loader2,
  Download,
  RefreshCw,
  Zap,
  ImageIcon,
  Lightbulb,
  Shuffle,
  Eye,
  Star,
  X,
} from "lucide-react";
import { useCredits } from "@/hooks/use-credits";
import { useAppContext } from "@/contexts/app";
import AIAssistant from "./ai-assistant";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

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
  const [numImages, setNumImages] = useState(1);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const { credits, refreshCredits } = useCredits();
  const availableCredits = typeof credits === 'object' && credits ? (credits as any).left_credits || 0 : credits;
  const { user, setShowSignModal } = useAppContext();
  const router = useRouter();

  // 灵感提示
  const inspirations = [
    "A majestic banana kingdom floating in the clouds, golden palace, fantasy art style",
    "Cyberpunk banana in neon-lit city, futuristic, holographic displays, night scene",
    "Banana astronaut exploring alien planet, sci-fi, detailed spacesuit, cosmic background",
    "Steampunk banana inventor in Victorian workshop, brass gears, vintage machinery",
    "Magical banana wizard casting spells, enchanted forest, glowing particles, ethereal",
    "Banana samurai in cherry blossom garden, traditional Japanese art style, sunset",
  ];

  const getRandomInspiration = () => {
    const randomIndex = Math.floor(Math.random() * inspirations.length);
    setPrompt(inspirations[randomIndex]);
    toast.success("💡 Inspiration loaded!");
  };

  // 计算所需积分
  const requiredCredits = numImages * 5;

  const handleGenerate = async () => {
    // 先检查是否登录
    if (!user) {
      toast("🔐 Please sign in to use this feature", {
        description: "Sign in to start generating amazing images",
        action: {
          label: "Sign In",
          onClick: () => setShowSignModal(true),
        },
      });
      return;
    }

    // 检查输入
    if (!prompt) {
      toast.error("Please enter a prompt");
      return;
    }

    // 检查积分
    if (availableCredits < requiredCredits) {
      toast("💳 Insufficient credits", {
        description: `You need ${requiredCredits} credits but only have ${availableCredits}`,
        action: {
          label: "Get Credits",
          onClick: () => router.push("/pricing"),
        },
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([]);
    setProgress(0);

    try {
      // 1. 提交任务
      setProgress(20); // 开始提交
      const submitResponse = await fetch("/api/nano-banana/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "text-to-image",
          prompt,
          num_images: numImages,
        }),
      });

      const submitData = await submitResponse.json();
      
      if (!submitData.success) {
        throw new Error(submitData.error || "Failed to submit task");
      }

      const taskId = submitData.task_id;
      setCurrentTaskId(taskId);
      setProgress(30); // 任务已提交

      // 2. 轮询状态
      let attempts = 0;
      const maxAttempts = 60; // 最多等待2分钟
      
      const pollInterval = setInterval(async () => {
        attempts++;
        // 进度从30%到90%，平滑增长
        const pollProgress = 30 + Math.min((attempts / maxAttempts) * 60, 60);
        setProgress(Math.round(pollProgress));

        try {
          const statusResponse = await fetch(`/api/nano-banana/status/${taskId}`);
          const statusData = await statusResponse.json();

          if (statusData.status === "COMPLETED") {
            clearInterval(pollInterval);
            setProgress(100);
            
            // 3. 获取结果
            const resultResponse = await fetch(`/api/nano-banana/result/${taskId}`);
            const resultData = await resultResponse.json();
            
            if (resultData.success && resultData.data) {
              const images = resultData.data.images || [];
              setGeneratedImages(images.map((img: any) => img.url));
              toast.success("Images generated successfully!");
              refreshCredits();
              // 只有在成功获取结果后才停止动画
              setIsGenerating(false);
              setProgress(0);
            } else {
              throw new Error("Failed to get results");
            }
          } else if (statusData.status === "FAILED") {
            clearInterval(pollInterval);
            setIsGenerating(false);
            setProgress(0);
            throw new Error("Generation failed");
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setIsGenerating(false);
            setProgress(0);
            throw new Error("Generation timeout");
          }
        } catch (error) {
          clearInterval(pollInterval);
          setIsGenerating(false);
          setProgress(0);
          throw error;
        }
      }, 2000);

    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate images");
      // 出错时才停止动画
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nano-banana-${Date.now()}-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded!");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  return (
    <div className="w-full">
      {/* AI Assistant 等待动画 */}
      {isGenerating && (
        <div className="mb-6">
          <AIAssistant
            isGenerating={isGenerating}
            progress={progress}
            message="Generating your images from text"
          />
        </div>
      )}

      {/* 左右布局容器 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 左侧：操作区 */}
        <div>
          <Card className="p-6">
            <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="prompt" className="text-base font-semibold">
                Describe your image
              </Label>
              <Button
                onClick={getRandomInspiration}
                size="sm"
                variant="ghost"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                disabled={isGenerating}
              >
                <Lightbulb className="w-4 h-4 mr-1" />
                Get Inspiration
              </Button>
            </div>
            <Textarea
              id="prompt"
              placeholder="A cute banana wearing sunglasses on a tropical beach..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none border-green-200 focus:border-green-400"
              disabled={isGenerating}
            />
            
            {/* 快速灵感标签 */}
            <div className="mt-3 space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Star className="w-3 h-3" /> Quick ideas:
              </p>
              <div className="flex flex-wrap gap-2">
                {["Fantasy", "Sci-fi", "Cyberpunk", "Steampunk", "Magical", "Artistic"].map((style) => (
                  <button
                    key={style}
                    onClick={() => {
                      const stylePrompts = {
                        "Fantasy": "fantasy art style, magical, ethereal lighting",
                        "Sci-fi": "futuristic, science fiction, high tech",
                        "Cyberpunk": "cyberpunk style, neon lights, dystopian",
                        "Steampunk": "steampunk aesthetic, Victorian era, brass and copper",
                        "Magical": "magical realism, glowing particles, enchanted",
                        "Artistic": "artistic painting, vibrant colors, masterpiece",
                      };
                      setPrompt(prev => prev ? `${prev}, ${stylePrompts[style as keyof typeof stylePrompts]}` : `Banana, ${stylePrompts[style as keyof typeof stylePrompts]}`);
                    }}
                    disabled={isGenerating}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium transition-all",
                      "bg-green-100 hover:bg-green-200",
                      "dark:bg-green-900/20 dark:hover:bg-green-800/30",
                      "border border-green-200 dark:border-green-800",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Number of Images Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">
                Number of Images: {numImages}
              </Label>
              <span className="text-sm text-muted-foreground">
                <Zap className="w-3 h-3 inline mr-1" />
                {requiredCredits} credits
              </span>
            </div>
            <Slider
              value={[numImages]}
              onValueChange={(value) => setNumImages(value[0])}
              min={1}
              max={4}
              step={1}
              disabled={isGenerating}
              className="w-full"
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={cn(
              "w-full",
              !user || availableCredits < requiredCredits
                ? "bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600"
                : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            )}
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : !user ? (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Sign In to Generate
              </>
            ) : availableCredits < requiredCredits ? (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Need {requiredCredits} Credits
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Images ({requiredCredits} credits)
              </>
            )}
          </Button>
            </div>
          </Card>
        </div>

        {/* 右侧：结果区 */}
        <div>
          {isGenerating ? (
            <Card className="p-6 h-full min-h-[500px] flex items-center justify-center">
              <div className="text-center space-y-6">
                {/* 生成中动画 */}
                <div className="relative">
                  <div className="w-24 h-24 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-green-200 dark:border-green-800"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
                  </div>
                </div>
                
                {/* 进度信息 */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Creating Your Images
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    AI is generating images from your text...
                  </p>
                  
                  {/* 进度条 */}
                  <div className="w-48 mx-auto mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* 生成提示 */}
                <div className="flex justify-center gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-green-500"
                      style={{
                        animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </Card>
          ) : generatedImages.length > 0 ? (
            <Card className="p-6">
              <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
                Generated Gallery
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {generatedImages.length} {generatedImages.length === 1 ? "image" : "images"}
                </span>
                <Button
                  onClick={() => {
                    setGeneratedImages([]);
                    setProgress(0);
                  }}
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-green-600"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
            
            {/* 图片选择器 */}
            {generatedImages.length > 1 && (
              <div className="flex gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                {generatedImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "flex-1 h-2 rounded-full transition-all",
                      index === selectedImageIndex
                        ? "bg-green-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    )}
                  />
                ))}
              </div>
            )}
            
            {/* 主图片显示 */}
            <div className="relative group">
              {generatedImages.length > 0 && (
                <>
                  <img
                    src={generatedImages[selectedImageIndex]}
                    alt={`Generated ${selectedImageIndex + 1}`}
                    className="w-full h-auto rounded-lg shadow-xl transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg">
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDownload(generatedImages[selectedImageIndex], selectedImageIndex)}
                          size="sm"
                          className="bg-white/90 hover:bg-white text-black"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          onClick={() => setIsFullscreen(true)}
                          size="sm"
                          variant="secondary"
                          className="bg-white/90 hover:bg-white"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                      <span className="text-white text-sm font-medium">
                        {selectedImageIndex + 1} / {generatedImages.length}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* 缩略图网格 */}
            {generatedImages.length > 1 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {generatedImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "relative rounded-lg overflow-hidden transition-all",
                      "hover:scale-105 hover:shadow-lg",
                      index === selectedImageIndex && "ring-2 ring-green-500 ring-offset-2"
                    )}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                    {index === selectedImageIndex && (
                      <div className="absolute inset-0 bg-green-500/20" />
                    )}
                  </button>
                ))}
              </div>
            )}
              </div>
            </Card>
          ) : (
            <Card className="p-6 h-full min-h-[500px] flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    No images generated yet
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter a prompt and click generate to create images
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
      
      {/* 全屏视图 */}
      {isFullscreen && generatedImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <img
            src={generatedImages[selectedImageIndex]}
            alt="Fullscreen view"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 text-white hover:text-green-400 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
      )}
    </div>
  );
}