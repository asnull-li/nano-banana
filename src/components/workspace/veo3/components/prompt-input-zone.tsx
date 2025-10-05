"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Info } from "lucide-react";
import { MIN_PROMPT_LENGTH, MAX_PROMPT_LENGTH } from "@/lib/constants/veo3";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PromptInputZoneProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  disabled?: boolean;
  className?: string;
  texts?: any;
}

export default function PromptInputZone({
  prompt,
  onPromptChange,
  disabled = false,
  className,
  texts = {},
}: PromptInputZoneProps) {
  const charCount = prompt.length;
  const isValid =
    charCount >= MIN_PROMPT_LENGTH && charCount <= MAX_PROMPT_LENGTH;
  const percentage = (charCount / MAX_PROMPT_LENGTH) * 100;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {texts.label || "Prompt"}
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">
                  {texts.tooltip || "Describe the video you want to generate. Be specific and detailed for best results."}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Badge
          variant={charCount === 0 ? "outline" : isValid ? "secondary" : "destructive"}
          className={
            charCount === 0
              ? "border-0 bg-transparent text-slate-400 dark:text-slate-500"
              : isValid
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : ""
          }
        >
          {charCount} / {MAX_PROMPT_LENGTH}
        </Badge>
      </div>

      <Textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        disabled={disabled}
        placeholder={texts.placeholder || "Describe your video... e.g., 'A cute cat playing with a ball of yarn in slow motion, cinematic lighting, 4K quality'"}
        className="min-h-[120px] resize-none text-sm"
        maxLength={MAX_PROMPT_LENGTH}
      />

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              percentage > 90
                ? "bg-red-500"
                : percentage > 70
                ? "bg-amber-500"
                : "bg-green-500"
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>

        {charCount < MIN_PROMPT_LENGTH && charCount > 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            {texts.min_chars_required?.replace("${count}", MIN_PROMPT_LENGTH) || `Minimum ${MIN_PROMPT_LENGTH} characters required`}
          </p>
        )}

        {charCount > MAX_PROMPT_LENGTH * 0.9 && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            {texts.approaching_limit || "Approaching character limit"}
          </p>
        )}
      </div>
    </div>
  );
}
