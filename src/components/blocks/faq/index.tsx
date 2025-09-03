"use client";

import { Badge } from "@/components/ui/badge";
import { Section as SectionType } from "@/types/blocks/section";
import { useState } from "react";

export default function FAQ({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null;
  }

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section
      id={section.name}
      className="relative py-20 lg:py-32 overflow-hidden"
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 -z-10">
        {/* 渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent [.dark_&]:via-green-400/10" />

        {/* 浮动元素 */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 [.dark_&]:bg-green-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 [.dark_&]:bg-cyan-400/20 rounded-full blur-3xl" />

        {/* 装饰线条 */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20 [.dark_&]:opacity-30"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="faq-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                className="[stop-color:#10b981] [stop-opacity:0.1]"
              />
              <stop
                offset="100%"
                className="[stop-color:#06b6d4] [stop-opacity:0.1]"
              />
            </linearGradient>
          </defs>
          <path
            d="M0,200 Q400,100 800,200 T1600,200"
            stroke="url(#faq-gradient)"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </div>

      <div className="container relative">
        {/* 标题区域 */}
        <div className="text-center mb-16">
          {section.label && (
            <Badge className="mb-6 bg-gradient-to-r from-green-500/10 to-cyan-500/10 [.dark_&]:from-green-400/20 [.dark_&]:to-cyan-400/20 text-green-700 [.dark_&]:text-green-600  border-green-500/30 [.dark_&]:border-green-400/40 px-4 py-1.5 text-xs font-semibold">
              {section.label}
            </Badge>
          )}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 via-green-800 to-slate-900 [.dark_&]:from-white [.dark_&]:via-green-300 [.dark_&]:to-white bg-clip-text text-transparent leading-tight mb-6">
            {section.title}
          </h2>
          <p className="text-lg md:text-xl text-slate-600 [.dark_&]:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {section.description}
          </p>
        </div>

        {/* FAQ 列表布局 */}
        <div className="flex flex-col gap-6 lg:gap-8 max-w-4xl mx-auto">
          {section.items?.map((item, index) => (
            <div
              key={index}
              className="group relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* 卡片背景光效 */}
              <div
                className={`absolute -inset-0.5 bg-gradient-to-r from-green-500 to-cyan-500 [.dark_&]:from-green-400 [.dark_&]:to-cyan-400 rounded-2xl opacity-0 group-hover:opacity-30 blur-sm transition-all duration-500 ${
                  hoveredIndex === index ? "opacity-30" : ""
                }`}
              />

              {/* 主卡片 */}
              <div className="relative bg-gradient-to-br from-white/80 to-slate-50/60 [.dark_&]:from-slate-800/60 [.dark_&]:to-slate-900/50 backdrop-blur-sm border border-slate-200/60 [.dark_&]:border-slate-700/50 rounded-2xl p-6 lg:p-8 transition-all duration-300 group-hover:border-green-500/30 [.dark_&]:group-hover:border-green-400/50 group-hover:shadow-xl group-hover:shadow-green-500/10 [.dark_&]:group-hover:shadow-green-400/20">
                <div className="flex gap-4">
                  {/* 问题编号 */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-cyan-500 [.dark_&]:from-green-400 [.dark_&]:to-cyan-400 rounded-xl blur opacity-50 group-hover:opacity-70 transition-opacity" />
                    <div className="relative w-12 h-12 bg-gradient-to-br from-green-500/20 to-cyan-500/20 [.dark_&]:from-green-400/30 [.dark_&]:to-cyan-400/30 group-hover:from-green-500 group-hover:to-cyan-500 [.dark_&]:group-hover:from-green-400 [.dark_&]:group-hover:to-cyan-400 rounded-xl flex items-center justify-center transition-all duration-300">
                      <span className="text-sm font-bold  group-hover:text-white transition-colors">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </div>

                  {/* 内容区域 */}
                  <div className="flex-1 space-y-3">
                    {/* 问题标题 */}
                    <h3 className="text-lg lg:text-xl font-semibold text-slate-900 [.dark_&]:text-white group-hover:text-green-600 [.dark_&]:group-hover:text-green-400 transition-colors leading-tight">
                      {item.title}
                    </h3>

                    {/* 答案内容 */}
                    <p className="text-slate-600 [.dark_&]:text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* 悬停箭头 */}
                  <div className="flex-shrink-0 self-start opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-2">
                    <svg
                      className="w-6 h-6 text-green-500 [.dark_&]:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                </div>

                {/* 角标装饰 */}
                <div className="absolute top-0 right-0 w-16 h-16 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path
                      d="M100,0 L100,100 L0,100"
                      className="stroke-green-500 [.dark_&]:stroke-green-400"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 底部提示 */}
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-500 [.dark_&]:text-slate-400">
            Have more questions?
            <a
              href="mailto:support@nanobanana.org"
              className="ml-2 text-green-600 [.dark_&]:text-green-400 hover:text-green-700 [.dark_&]:hover:text-green-300 font-semibold transition-colors"
            >
              Contact our support team →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
