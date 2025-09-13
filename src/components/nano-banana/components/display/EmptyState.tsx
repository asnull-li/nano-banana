import React from 'react';
import { Sparkles, Zap, Wand2, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      {/* 动画图标 */}
      <div className="relative mb-8">
        <div className="absolute inset-0 blur-3xl opacity-20">
          <div className="w-32 h-32 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full" />
        </div>
        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-green-500/25">
          <Sparkles className="h-16 w-16 text-white animate-pulse" />
        </div>
        
        {/* 环绕图标 */}
        <div className="absolute -top-2 -right-2 p-2 rounded-full bg-white dark:bg-slate-800 shadow-lg">
          <ImageIcon className="h-5 w-5 text-green-500" />
        </div>
        <div className="absolute -bottom-2 -left-2 p-2 rounded-full bg-white dark:bg-slate-800 shadow-lg">
          <Wand2 className="h-5 w-5 text-cyan-500" />
        </div>
        <div className="absolute -top-2 -left-2 p-2 rounded-full bg-white dark:bg-slate-800 shadow-lg">
          <Zap className="h-5 w-5 text-yellow-500" />
        </div>
      </div>

      <div className="space-y-4 max-w-md">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent">
          准备好开始创作了吗？
        </h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          在左侧选择模式，上传图片或输入描述，让 AI 为你创造精彩的视觉作品
        </p>
      </div>

      {/* 特性展示 */}
      <div className="grid grid-cols-3 gap-6 mt-12 w-full max-w-lg">
        {[
          { icon: Sparkles, label: "AI 智能", color: "text-green-500" },
          { icon: Zap, label: "极速生成", color: "text-yellow-500" },
          { icon: Wand2, label: "高质量", color: "text-cyan-500" },
        ].map((feature, idx) => (
          <div key={idx} className="flex flex-col items-center space-y-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 shadow-lg">
              <feature.icon className={cn("h-6 w-6", feature.color)} />
            </div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {feature.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}