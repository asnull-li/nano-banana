"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Zap, User, Info } from "lucide-react";
import { MIN_SCALE, MAX_SCALE, DEFAULT_SCALE } from "@/lib/constants/upscaler";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UpscalerControlsProps {
  scale: number;
  onScaleChange: (scale: number) => void;
  faceEnhance: boolean;
  onFaceEnhanceChange: (enabled: boolean) => void;
  disabled?: boolean;
  className?: string;
  pageData?: any;
}

export default function UpscalerControls({
  scale,
  onScaleChange,
  faceEnhance,
  onFaceEnhanceChange,
  disabled = false,
  className,
  pageData,
}: UpscalerControlsProps) {
  const scaleOptions = [
    { value: 1, label: "1x", description: pageData?.workspace?.controls?.scale_1x || "Original" },
    { value: 2, label: "2x", description: pageData?.workspace?.controls?.scale_2x || "Standard" },
    { value: 3, label: "3x", description: pageData?.workspace?.controls?.scale_3x || "Large" },
    { value: 4, label: "4x", description: pageData?.workspace?.controls?.scale_4x || "Maximum" },
  ];

  return (
    <div className={className}>
      <div className="space-y-5">
          {/* Scale Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-500" />
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {pageData?.workspace?.controls?.scale_factor || "Upscale Factor"}
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        {pageData?.workspace?.controls?.scale_tooltip || "Choose how much to enlarge your image"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              >
                {scale}x
              </Badge>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {scaleOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onScaleChange(option.value)}
                  disabled={disabled}
                  className={`
                    p-2.5 rounded-lg border transition-all duration-200 text-center relative overflow-hidden
                    ${scale === option.value 
                      ? 'border-green-500/60 bg-green-500/10 dark:bg-green-500/20' 
                      : 'border-slate-200/80 dark:border-slate-600/60 hover:border-green-400/60 dark:hover:border-green-400/60 hover:bg-green-50/50 dark:hover:bg-green-500/10'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                  `}
                >
                  <div className="space-y-1">
                    <div className={`text-sm font-semibold ${
                      scale === option.value 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {option.label}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {option.description}
                    </div>
                  </div>
                  {scale === option.value && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

          {/* Face Enhancement */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-500" />
                <Label
                  htmlFor="face-enhance"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  {pageData?.workspace?.controls?.face_enhance || "Face Enhancement"}
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        {pageData?.workspace?.controls?.face_enhance_tooltip || "Uses GFPGAN to enhance facial details"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Switch
                id="face-enhance"
                checked={faceEnhance}
                onCheckedChange={onFaceEnhanceChange}
                disabled={disabled}
              />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {pageData?.workspace?.controls?.face_enhance_description || "Improves facial details and skin texture when enabled"}
            </p>
          </div>
      </div>
    </div>
  );
}
