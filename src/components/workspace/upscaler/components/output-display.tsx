"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Compare } from "@/components/ui/compare";
import {
  Download,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Maximize2,
  Eye,
} from "lucide-react";
import { downloadImage, generateImageFilename } from "@/lib/download-utils";
import { useState } from "react";
import { toast } from "sonner";
import CompareModal from "./compare-modal";

interface OutputDisplayProps {
  originalImage?: string | null;
  upscaledImage?: string | null;
  isProcessing?: boolean;
  status: "idle" | "uploading" | "processing" | "completed" | "failed";
  scale?: number;
  faceEnhance?: boolean;
  onReset?: () => void;
  className?: string;
  pageData?: any;
}

export default function OutputDisplay({
  originalImage,
  upscaledImage,
  isProcessing = false,
  status,
  scale = 2,
  faceEnhance = false,
  onReset,
  className,
  pageData,
}: OutputDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDownload = async () => {
    if (!upscaledImage) return;

    try {
      setIsDownloading(true);
      await downloadImage(upscaledImage, {
        filename: `${generateImageFilename("upscaler", "edited")}.jpg`,
        onStart: () => toast.info(pageData?.workspace?.messages?.download_preparing || "Preparing download..."),
        onComplete: () => toast.success(pageData?.workspace?.messages?.download_success || "Image downloaded successfully!"),
      });
    } catch (error) {
      toast.error(pageData?.workspace?.messages?.download_failed || "Failed to download image");
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const renderContent = () => {
    // Empty State
    if (!originalImage) {
      return (
        <div className="h-[500px] flex flex-col items-center justify-center text-center space-y-4">
          <ImageIcon className="w-15 h-15 text-blak dark:text-white" />
          <div className="space-y-2">
            <h4 className="text-lg font-medium text-slate-600 dark:text-slate-400">
              {pageData?.workspace?.results?.no_image_title || "No image uploaded"}
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              {pageData?.workspace?.results?.no_image_description || "Upload an image to see the upscaled result here"}
            </p>
          </div>
        </div>
      );
    }

    // Processing State
    if (isProcessing) {
      return (
        <div className="h-[500px] relative bg-slate-100 dark:bg-slate-800 rounded-lg">
          {/* Background Image */}
          <img
            src={originalImage}
            alt={pageData?.workspace?.results?.processing_preview_alt || "Processing preview"}
            className="w-full h-full object-contain rounded-lg opacity-30"
          />

          {/* Processing Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center space-y-6">
              {/* Loading Spinner */}

              <div className="w-20 h-20 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>

              {/* Status Text */}
              <div className="space-y-3">
                <h4 className="text-xl font-bold text-white">
                  {status === "uploading"
                    ? (pageData?.workspace?.status?.uploading || "Uploading image...")
                    : (pageData?.workspace?.status?.processing || "Enhancing image...")}
                </h4>
                <p className="text-slate-300 max-w-sm">
                  {status === "uploading"
                    ? (pageData?.workspace?.results?.uploading_description || "Preparing your image for processing")
                    : (pageData?.workspace?.results?.processing_description || "AI is upscaling and enhancing your image")}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-80 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-cyan-400 rounded-full animate-pulse"></div>
              </div>

              {/* Processing Dots */}
              <div className="flex items-center justify-center space-x-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                    style={{
                      animationDelay: `${i * 0.3}s`,
                      animationDuration: "1.5s",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Error State
    if (status === "failed") {
      return (
        <div className="h-[500px] flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-medium text-red-600 dark:text-red-400">
              {pageData?.workspace?.results?.failed_title || "Processing failed"}
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              {pageData?.workspace?.results?.failed_description || "Something went wrong while upscaling your image"}
            </p>
          </div>
        </div>
      );
    }

    // Success State with Compare
    if (status === "completed" && upscaledImage) {
      return (
        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              {pageData?.workspace?.results?.completed_badge || "Upscaling completed"}
            </Badge>

            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              size="sm"
              className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white shadow-sm"
            >
              {isDownloading ? (
                <>
                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  {pageData?.workspace?.results?.downloading || "Downloading..."}
                </>
              ) : (
                <>
                  <Download className="w-3 h-3 mr-2" />
                  {pageData?.workspace?.results?.download || "Download"}
                </>
              )}
            </Button>
          </div>

          {/* Compare Component - Clickable */}
          <div
            className="rounded-xl overflow-hidden shadow-lg cursor-pointer group transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] bg-slate-100 dark:bg-slate-800 relative"
            onClick={() => setIsModalOpen(true)}
            title={pageData?.workspace?.results?.click_to_enlarge || "点击放大查看对比"}
          >
            <div className="relative">
              <Compare
                firstImage={originalImage}
                secondImage={upscaledImage}
                firstImageClassName="object-contain w-full h-[450px]"
                secondImageClassName="object-contain w-full h-[450px]"
                className="w-full h-[450px]"
                slideMode="hover"
                firstImageLabel={pageData?.workspace?.results?.original || "Original"}
                secondImageLabel={pageData?.workspace?.results?.upscaled || "Upscaled"}
              />

              {/* Hover Overlay with Expand Icon */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                  <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                    <Maximize2 className="w-6 h-6 text-slate-700 dark:text-slate-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Info */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                {pageData?.workspace?.results?.original || "Original"}
              </p>
              <p className="text-sm text-slate-800 dark:text-slate-200">
                {pageData?.workspace?.results?.standard_resolution || "Standard Resolution"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">
                {pageData?.workspace?.results?.enhanced || "Enhanced"}
              </p>
              <p className="text-sm text-slate-800 dark:text-slate-200">
                {pageData?.workspace?.results?.ai_upscaled || "AI Upscaled & Enhanced"}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Original Image Only (waiting for processing)
    return (
      <div className="h-[500px] bg-slate-100 dark:bg-slate-800 rounded-lg">
        <img
          src={originalImage}
          alt={pageData?.workspace?.results?.original_image_alt || "Original image"}
          className="w-full h-full object-contain rounded-lg"
        />
      </div>
    );
  };

  return (
    <>
      <div className={className}>{renderContent()}</div>

      {/* Compare Modal */}
      {status === "completed" && originalImage && upscaledImage && (
        <CompareModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          originalImage={originalImage}
          upscaledImage={upscaledImage}
          scale={scale}
          faceEnhance={faceEnhance}
          onReset={onReset}
          pageData={pageData}
        />
      )}
    </>
  );
}
