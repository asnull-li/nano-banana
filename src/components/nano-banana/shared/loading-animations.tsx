"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LoadingAnimationProps {
  type?: "dots" | "pulse" | "spinner" | "gradient";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingDots({ size = "md", className }: Omit<LoadingAnimationProps, "type">) {
  const sizeClasses = {
    sm: "space-x-1",
    md: "space-x-2", 
    lg: "space-x-3",
  };

  const dotSizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <div className={cn("flex items-center", sizeClasses[size], className)}>
      <div className={cn(dotSizes[size], "bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]")} />
      <div className={cn(dotSizes[size], "bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]")} />
      <div className={cn(dotSizes[size], "bg-green-500 rounded-full animate-bounce")} />
    </div>
  );
}

export function LoadingPulse({ size = "md", className }: Omit<LoadingAnimationProps, "type">) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full animate-ping" />
      <div className="relative bg-gradient-to-r from-green-500 to-cyan-500 rounded-full h-full w-full" />
    </div>
  );
}

export function LoadingSpinner({ size = "md", className }: Omit<LoadingAnimationProps, "type">) {
  const sizeClasses = {
    sm: "h-8 w-8 border-2",
    md: "h-12 w-12 border-3",
    lg: "h-16 w-16 border-4",
  };

  return (
    <div className={cn(
      "animate-spin rounded-full",
      "border-slate-200 dark:border-slate-700",
      "border-t-green-500 border-r-cyan-500",
      sizeClasses[size],
      className
    )} />
  );
}

export function LoadingGradient({ size = "md", className }: Omit<LoadingAnimationProps, "type">) {
  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={cn("w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700", sizeClasses[size], className)}>
      <div className="h-full w-full animate-gradient-x bg-gradient-to-r from-transparent via-green-500 to-transparent" />
      <style jsx>{`
        @keyframes gradient-x {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-gradient-x {
          animation: gradient-x 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default function LoadingAnimation({ 
  type = "dots", 
  size = "md", 
  className 
}: LoadingAnimationProps) {
  switch (type) {
    case "dots":
      return <LoadingDots size={size} className={className} />;
    case "pulse":
      return <LoadingPulse size={size} className={className} />;
    case "spinner":
      return <LoadingSpinner size={size} className={className} />;
    case "gradient":
      return <LoadingGradient size={size} className={className} />;
    default:
      return <LoadingDots size={size} className={className} />;
  }
}