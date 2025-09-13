"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Badge } from "@/components/ui/badge";
import { Section as SectionType } from "@/types/blocks/section";
import { useState } from "react";

export default function Feature3({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null;
  }

  const [activeTab, setActiveTab] = useState("tab-1");

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* 动态背景 */}
      <div className="absolute inset-0 -z-10">
        {/* 流动的线条 */}
        <svg
          className="absolute inset-0 w-full h-full opacity-30 [.dark_&]:opacity-40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                className="stroke-green-500/10 [.dark_&]:stroke-green-400/20"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* 渐变球体 */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-radial from-cyan-500/20 to-transparent [.dark_&]:from-cyan-400/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-radial from-green-500/20 to-transparent [.dark_&]:from-green-400/30 rounded-full blur-3xl" />
      </div>

      <div className="container relative">
        {/* 创新的分屏布局 */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* 左侧 - 标题和步骤 */}
          <div className="order-2 lg:order-1">
            <div className="mb-8">
              {section.label && (
                <Badge className="mb-4 bg-gradient-to-r from-green-500/10 to-cyan-500/10 [.dark_&]:from-green-400/20 [.dark_&]:to-cyan-400/20 text-green-700 [.dark_&]:text-green-300 border-green-500/30 [.dark_&]:border-green-400/40 px-4 py-1">
                  {section.label}
                </Badge>
              )}
              <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 to-cyan-800 [.dark_&]:from-white [.dark_&]:to-cyan-300 bg-clip-text text-transparent leading-tight mb-6">
                {section.title}
              </h2>
              <p className="text-lg text-slate-600 [.dark_&]:text-slate-300 leading-relaxed">
                {section.description}
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex flex-col space-y-4 bg-transparent">
                {section.items?.map((item, index) => (
                  <TabsTrigger
                    key={index}
                    value={`tab-${index + 1}`}
                    className="group w-full data-[state=active]:bg-transparent p-0"
                  >
                    <div
                      className={`relative w-full flex items-start gap-4 p-5 rounded-xl bg-gradient-to-r from-white/60 to-slate-50/40 [.dark_&]:from-slate-800/40 [.dark_&]:to-slate-900/30 border transition-all duration-300 ${
                        activeTab === `tab-${index + 1}`
                          ? "border-green-500/50 [.dark_&]:border-green-400/60 shadow-lg shadow-green-500/10 [.dark_&]:shadow-green-400/20"
                          : "border-slate-200/60 [.dark_&]:border-slate-700/50 hover:border-green-500/30 [.dark_&]:hover:border-green-400/40"
                      }`}
                    >
                      {/* 步骤数字 */}
                      <div className="relative flex-shrink-0">
                        <div
                          className={`absolute inset-0 bg-gradient-to-br from-green-500 to-cyan-500 [.dark_&]:from-green-400 [.dark_&]:to-cyan-400 rounded-lg blur-md transition-opacity ${
                            activeTab === `tab-${index + 1}`
                              ? "opacity-60"
                              : "opacity-0"
                          }`}
                        />
                        <div
                          className={`relative w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all ${
                            activeTab === `tab-${index + 1}`
                              ? "bg-gradient-to-br from-green-500 to-cyan-500 [.dark_&]:from-green-400 [.dark_&]:to-cyan-400 text-white"
                              : "bg-slate-100 [.dark_&]:bg-slate-800 text-slate-600 [.dark_&]:text-slate-400"
                          }`}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </div>
                      </div>

                      {/* 内容 */}
                      <div className="flex-1">
                        <h3
                          className={`font-semibold mb-2 transition-colors ${
                            activeTab === `tab-${index + 1}`
                              ? "text-green-600 [.dark_&]:text-green-400"
                              : "text-slate-800 [.dark_&]:text-slate-200"
                          }`}
                        >
                          {item.title}
                        </h3>
                        <p className="text-sm text-slate-600 [.dark_&]:text-slate-400 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* 活动指示器 */}
                      {activeTab === `tab-${index + 1}` && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-green-500 to-cyan-500 [.dark_&]:from-green-400 [.dark_&]:to-cyan-400 rounded-l-full" />
                      )}
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* 移动端图片显示 */}
              <div className="mt-8 lg:hidden">
                {section.items?.map((item, index) => (
                  <TabsContent
                    key={index}
                    value={`tab-${index + 1}`}
                    className="relative rounded-2xl overflow-hidden"
                  >
                    {item.image && (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        <img
                          src={item.image.src}
                          alt={item.image.alt || item.title}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </div>

          {/* 右侧 - 图片展示（桌面端） */}
          <div className="order-1 lg:order-2 hidden lg:block">
            <div className="sticky top-20">
              <Tabs value={activeTab}>
                {section.items?.map((item, index) => (
                  <TabsContent
                    key={index}
                    value={`tab-${index + 1}`}
                    className="relative"
                  >
                    {item.image && (
                      <div className="relative group">
                        {/* 装饰边框 */}
                        <div className="absolute -inset-2 bg-gradient-to-r from-green-500 via-cyan-500 to-green-500 [.dark_&]:from-green-400 [.dark_&]:via-cyan-400 [.dark_&]:to-green-400 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />

                        {/* 主图片容器 */}
                        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-white [.dark_&]:from-slate-900 [.dark_&]:to-slate-800 p-1">
                          <img
                            src={item.image.src}
                            alt={item.image.alt || item.title}
                            className="w-full h-auto rounded-xl object-cover"
                          />

                          {/* 图片覆盖层 */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* 角标装饰 */}
                        <div className="absolute -top-4 -right-4 w-20 h-20 border-t-2 border-r-2 border-green-500/30 [.dark_&]:border-green-400/50 rounded-tr-2xl" />
                        <div className="absolute -bottom-4 -left-4 w-20 h-20 border-b-2 border-l-2 border-cyan-500/30 [.dark_&]:border-cyan-400/50 rounded-bl-2xl" />

                        {/* 步骤标签 */}
                        <div className="absolute top-4 left-4 bg-black/50 [.dark_&]:bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                          <span className="text-xs font-medium text-white">
                            Step {index + 1}
                          </span>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
