"use client";

import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Upload, 
  Zap, 
  RefreshCw 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "idle" | "uploading" | "processing" | "completed" | "failed";
  error?: string;
  className?: string;
}

const statusConfig = {
  idle: {
    icon: Clock,
    label: "Ready",
    description: "Upload an image to start upscaling",
    color: "text-slate-500",
    bgColor: "bg-slate-100 dark:bg-slate-800",
    borderColor: "border-slate-200 dark:border-slate-700",
    animate: false,
  },
  uploading: {
    icon: Upload,
    label: "Uploading",
    description: "Preparing your image for processing",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    animate: true,
  },
  processing: {
    icon: Zap,
    label: "Processing",
    description: "AI is enhancing your image",
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
    animate: true,
  },
  completed: {
    icon: CheckCircle,
    label: "Completed",
    description: "Image has been successfully upscaled",
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
    animate: false,
  },
  failed: {
    icon: AlertCircle,
    label: "Failed",
    description: "Something went wrong during processing",
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
    animate: false,
  },
};

export default function StatusIndicator({ 
  status, 
  error, 
  className 
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  // Don't show indicator for idle state
  if (status === "idle") {
    return null;
  }

  return (
    <div className={cn(
      "p-4 transition-all duration-300 rounded-xl border shadow-sm",
      config.bgColor,
      config.borderColor,
      className
    )}>
      <div className="flex items-center gap-3">
        {/* Status Icon */}
        <div className="relative">
          <Icon className={cn("w-5 h-5", config.color)} />
          {config.animate && (
            <div className="absolute inset-0">
              <Icon className={cn("w-5 h-5 animate-pulse", config.color)} />
            </div>
          )}
        </div>

        {/* Status Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={cn("text-sm font-medium", config.color)}>
              {config.label}
            </h4>
            
            {/* Animated Badge for Processing States */}
            {config.animate && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs",
                  status === "uploading" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                  status === "processing" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                  ""
                )}
              >
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                In Progress
              </Badge>
            )}
          </div>
          
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {error || config.description}
          </p>
        </div>

        {/* Progress Indicator */}
        {config.animate && (
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-1 h-4 rounded-full animate-pulse",
                  config.color.includes("blue") ? "bg-blue-400" : "bg-green-400"
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "1s",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Progress Bar for Processing States */}
      {config.animate && (
        <div className="mt-3">
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className={cn(
              "h-full rounded-full transition-all duration-1000",
              status === "uploading" ? "bg-blue-500" : "bg-gradient-to-r from-green-500 to-cyan-500"
            )}>
              <div className="w-full h-full bg-white/30 animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}