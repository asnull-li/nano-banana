"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Upload,
  Wand2,
  Download,
  Loader2,
  X,
  Zap,
  Sun,
  Palette,
  Eraser,
  Camera,
  RefreshCw,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { useCredits } from "@/hooks/use-credits";
import { useAppContext } from "@/contexts/app";
import AIAssistant from "./ai-assistant";
import { Compare } from "@/components/ui/compare";
import { useRouter } from "next/navigation";

interface ImageToImageModeProps {
  onGenerate?: (prompt: string, options: any) => Promise<void>;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  url?: string;
}

export default function ImageToImageMode({
  isGenerating,
  setIsGenerating,
}: ImageToImageModeProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [numOutputImages, setNumOutputImages] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedCompareIndex, setSelectedCompareIndex] = useState(0);

  const { credits, refreshCredits } = useCredits();
  const availableCredits = typeof credits === 'object' && credits ? (credits as any).left_credits || 0 : credits;
  const { user, setShowSignModal } = useAppContext();
  const router = useRouter();

  // 计算所需积分
  const requiredCredits = numOutputImages * 5;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // 限制最多2张图片
    const maxImages = 2;
    const currentCount = uploadedImages.length;
    const availableSlots = maxImages - currentCount;
    
    if (availableSlots <= 0) {
      toast.error("Maximum 2 images allowed");
      return;
    }

    const filesToAdd = acceptedFiles.slice(0, availableSlots);
    
    const newImages: UploadedImage[] = filesToAdd.map(file => ({
      id: Math.random().toString(36).substring(2, 11),
      file,
      preview: URL.createObjectURL(file),
    }));

    setUploadedImages(prev => [...prev, ...newImages]);
    setGeneratedImages([]);

    if (filesToAdd.length < acceptedFiles.length) {
      toast.warning(`Only first ${filesToAdd.length} images were added (max 2)`);
    }
  }, [uploadedImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 2,
    disabled: uploadedImages.length >= 2,
  });

  const removeImage = (id: string) => {
    setUploadedImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove?.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  // 快速动作按钮
  const quickActions = [
    {
      icon: Sun,
      label: "Enhance Lighting",
      prompt: "Improve the lighting and make the image brighter and more vibrant",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Palette,
      label: "Artistic Style",
      prompt: "Transform into an artistic painting style with vibrant colors",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Eraser,
      label: "Remove Background",
      prompt: "Remove the background and make it transparent or white",
      color: "from-red-500 to-rose-500",
    },
    {
      icon: Camera,
      label: "Professional Edit",
      prompt: "Apply professional photo editing with enhanced colors and sharpness",
      color: "from-blue-500 to-indigo-500",
    },
  ];


  /**
   * Upload image to R2 storage
   */
  const uploadImageToR2 = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Upload failed");
      }

      return data.url;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
      throw error;
    }
  };

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
    if (!prompt || uploadedImages.length === 0) {
      toast.error("Please upload at least one image and enter a prompt");
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
    setIsUploading(true);

    try {
      // 1. 上传图片到 R2 并获取 URL
      const imageUrls: string[] = [];
      
      for (let i = 0; i < uploadedImages.length; i++) {
        const img = uploadedImages[i];
        if (!img.url) {
          // 更新上传进度 (0-30%)
          const uploadProgress = Math.round(((i + 1) / uploadedImages.length) * 30);
          setProgress(uploadProgress);
          // 上传到 R2 存储
          const uploadedUrl = await uploadImageToR2(img.file);
          imageUrls.push(uploadedUrl);
          // 更新本地记录
          img.url = uploadedUrl;
        } else {
          imageUrls.push(img.url);
        }
      }
      
      setIsUploading(false);
      setProgress(35); // 上传完成，进入生成阶段

      // 2. 提交任务
      setProgress(40); // 提交任务中
      const submitResponse = await fetch("/api/nano-banana/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "image-to-image",
          prompt,
          image_urls: imageUrls,
          num_images: numOutputImages,
        }),
      });

      const submitData = await submitResponse.json();
      
      if (!submitData.success) {
        throw new Error(submitData.error || "Failed to submit task");
      }

      const taskId = submitData.task_id;
      setProgress(45); // 任务已提交

      // 3. 轮询状态
      let attempts = 0;
      const maxAttempts = 60;
      
      const pollInterval = setInterval(async () => {
        attempts++;
        // 进度从45%到90%，平滑增长
        const pollProgress = 45 + Math.min((attempts / maxAttempts) * 45, 45);
        setProgress(Math.round(pollProgress));

        try {
          const statusResponse = await fetch(`/api/nano-banana/status/${taskId}`);
          const statusData = await statusResponse.json();

          if (statusData.status === "COMPLETED") {
            clearInterval(pollInterval);
            setProgress(100);
            
            // 4. 获取结果
            const resultResponse = await fetch(`/api/nano-banana/result/${taskId}`);
            const resultData = await resultResponse.json();
            
            if (resultData.success && resultData.data) {
              const images = resultData.data.images || [];
              setGeneratedImages(images.map((img: any) => img.url));
              toast.success("Images generated successfully!");
              refreshCredits();
              // 自动开启对比模式
              if (images.length > 0 && uploadedImages.length > 0) {
                setCompareMode(true);
              }
              // 只有在成功获取结果后才停止动画
              setIsGenerating(false);
              setIsUploading(false);
              setProgress(0);
            } else {
              throw new Error("Failed to get results");
            }
          } else if (statusData.status === "FAILED") {
            clearInterval(pollInterval);
            setIsGenerating(false);
            setIsUploading(false);
            setProgress(0);
            throw new Error("Generation failed");
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setIsGenerating(false);
            setIsUploading(false);
            setProgress(0);
            throw new Error("Generation timeout");
          }
        } catch (error) {
          clearInterval(pollInterval);
          setIsGenerating(false);
          setIsUploading(false);
          setProgress(0);
          throw error;
        }
      }, 2000);

    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate images");
      // 出错时才停止动画
      setIsGenerating(false);
      setIsUploading(false);
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
      a.download = `nano-banana-edited-${Date.now()}-${index + 1}.png`;
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
            message={isUploading ? "Uploading images to cloud storage" : "Generating your images"}
          />
        </div>
      )}

      {/* 左右布局容器 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 左侧：操作区 */}
        <div className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold mb-2">
              Upload Images (Max 2)
            </Label>
            <div className="grid grid-cols-2 gap-4">
              {/* Uploaded Images */}
              {uploadedImages.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.preview}
                    alt="Uploaded"
                    className="w-full h-48 object-cover rounded-lg border-2 border-green-200"
                  />
                  <Button
                    onClick={() => removeImage(image.id)}
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              {/* Upload Zone */}
              {uploadedImages.length < 2 && (
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors h-48 flex flex-col items-center justify-center",
                    isDragActive
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : "border-gray-300 hover:border-green-400"
                  )}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isDragActive
                      ? "Drop the image here"
                      : `Click or drag image ${uploadedImages.length + 1}/2`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Prompt Input */}
          <div>
            <Label htmlFor="edit-prompt" className="text-base font-semibold mb-2">
              Describe how to edit the images
            </Label>
            <Textarea
              id="edit-prompt"
              placeholder="Make it more colorful and add a sunset background..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isGenerating}
            />
            
            {/* Quick Actions */}
            {uploadedImages.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-muted-foreground">Quick actions:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action) => {
                    const IconComponent = action.icon;
                    return (
                      <button
                        key={action.label}
                        onClick={() => setPrompt(action.prompt)}
                        disabled={isGenerating}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                          "border border-green-200 dark:border-green-800",
                          "hover:bg-green-50 dark:hover:bg-green-900/20",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        <IconComponent className="h-4 w-4 text-green-600" />
                        <span>{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

              {/* Number of Output Images */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">
                    Output Images: {numOutputImages}
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    <Zap className="w-3 h-3 inline mr-1" />
                    {requiredCredits} credits
                  </span>
                </div>
                <Slider
                  value={[numOutputImages]}
                  onValueChange={(value) => setNumOutputImages(value[0])}
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
                    Processing...
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
                    <Wand2 className="w-4 h-4 mr-2" />
                    Edit Images ({requiredCredits} credits)
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
                    Generating Images
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isUploading ? "Uploading images..." : "Processing your request..."}
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
                Generated Images
              </h3>
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
            {/* 对比模式切换 */}
            {uploadedImages.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <Button
                  onClick={() => setCompareMode(!compareMode)}
                  size="sm"
                  variant={compareMode ? "default" : "outline"}
                  className={compareMode 
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600" 
                    : "border-green-200 hover:border-green-400"
                  }
                >
                  {compareMode ? "Hide Comparison" : "Show Comparison"}
                </Button>
                {compareMode && generatedImages.length > 1 && (
                  <div className="flex gap-1">
                    {generatedImages.map((_, index) => (
                      <Button
                        key={index}
                        onClick={() => setSelectedCompareIndex(index)}
                        size="sm"
                        variant={selectedCompareIndex === index ? "default" : "ghost"}
                        className={cn(
                          "px-2 py-1 h-7",
                          selectedCompareIndex === index && "bg-green-500 hover:bg-green-600"
                        )}
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 对比视图或普通网格 */}
            {compareMode && uploadedImages.length > 0 ? (
              <div className="rounded-lg overflow-hidden shadow-lg">
                <Compare
                  firstImage={uploadedImages[0].preview}
                  secondImage={generatedImages[selectedCompareIndex]}
                  firstImageClassName="object-cover"
                  secondImageClassName="object-cover"
                  className="h-[500px] w-full"
                  slideMode="hover"
                  showHandlebar
                />
                <div className="flex justify-between p-2 bg-green-50 dark:bg-green-900/20">
                  <span className="text-sm font-medium">Original</span>
                  <span className="text-sm font-medium">Generated</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Generated ${index + 1}`}
                      className="w-full h-auto rounded-lg shadow-md"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                      <Button
                        onClick={() => handleDownload(image, index)}
                        size="sm"
                        variant="secondary"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
              </div>
            </Card>
          ) : (
            <Card className="p-6 h-full min-h-[500px] flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Camera className="w-10 h-10 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    No images generated yet
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload images and describe edits to get started
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}