import React from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, Palette, Zap, Camera, Sparkles } from 'lucide-react';

interface QuickPromptsProps {
  mode: "image-to-image" | "text-to-image";
  prompt: string;
  onPromptChange: (prompt: string) => void;
  disabled?: boolean;
}

export default function QuickPrompts({ mode, prompt, onPromptChange, disabled = false }: QuickPromptsProps) {
  const quickPrompts = mode === "image-to-image" ? [
    { icon: Lightbulb, label: "增强细节", prompt: "增强细节，高清，精细" },
    { icon: Palette, label: "艺术风格", prompt: "艺术风格，油画质感" },
    { icon: Zap, label: "动漫风格", prompt: "动漫风格，二次元" },
    { icon: Camera, label: "写实照片", prompt: "写实风格，摄影质感" },
  ] : [
    { icon: Palette, label: "艺术创作", prompt: "艺术风格，高质量，精美" },
    { icon: Camera, label: "写实风格", prompt: "写实风格，高清摄影" },
    { icon: Sparkles, label: "科幻未来", prompt: "科幻风格，未来感" },
    { icon: Lightbulb, label: "创意设计", prompt: "创意设计，独特视角" },
  ];

  return (
    <div className="grid grid-cols-2 gap-1">
      {quickPrompts.map((item, idx) => (
        <Button
          key={idx}
          variant="outline"
          size="sm"
          className="h-auto py-2 px-2 justify-start text-xs border-slate-200 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-950/20"
          onClick={() => onPromptChange(prompt ? `${prompt}, ${item.prompt}` : item.prompt)}
          disabled={disabled}
        >
          <item.icon className="h-3 w-3 mr-1 text-green-500" />
          <span className="truncate">{item.label}</span>
        </Button>
      ))}
    </div>
  );
}