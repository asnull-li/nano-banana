"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";

interface PromptInputZoneProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  disabled?: boolean;
  maxLength?: number;
}

export default function PromptInputZone({
  prompt,
  onPromptChange,
  disabled = false,
  maxLength = 5000,
}: PromptInputZoneProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-emerald-500" />
        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Prompt
        </Label>
      </div>

      <Textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        disabled={disabled}
        placeholder="Describe the video you want to generate..."
        className="min-h-[120px] resize-none text-sm"
        maxLength={maxLength}
      />

      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Describe your desired video motion and content</span>
        <span>
          {prompt.length} / {maxLength}
        </span>
      </div>
    </div>
  );
}
