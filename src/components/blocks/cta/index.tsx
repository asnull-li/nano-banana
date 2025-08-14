import { Button } from "@/components/ui/button";
import Icon from "@/components/icon";
import Link from "next/link";
import { Section as SectionType } from "@/types/blocks/section";

export default function CTA({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null;
  }

  return (
    <section id={section.name} className="relative py-20 lg:py-32 overflow-hidden">
      <div className="container relative">
        <div className="relative">
          {/* 动态背景效果 */}
          <div className="absolute inset-0 -z-10 rounded-3xl overflow-hidden">
            {/* 主渐变背景 */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/90 via-cyan-500/90 to-green-500/90 [.dark_&]:from-green-600/80 [.dark_&]:via-cyan-600/80 [.dark_&]:to-green-600/80" />
            
            {/* 动态光效 */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/20 [.dark_&]:bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/20 [.dark_&]:bg-cyan-300/10 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
            
            {/* 网格纹理 */}
            <div className="absolute inset-0 opacity-10 [.dark_&]:opacity-5">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="cta-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                    <path d="M0 32V0h32" fill="none" stroke="white" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#cta-grid)" />
              </svg>
            </div>

            {/* 装饰圆圈 */}
            <div className="absolute -top-20 -right-20 w-40 h-40 border-4 border-white/20 [.dark_&]:border-white/10 rounded-full" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 border-4 border-white/20 [.dark_&]:border-white/10 rounded-full" />
          </div>

          {/* 内容区域 */}
          <div className="relative z-10 px-8 py-16 md:px-16 md:py-20 text-center">
            <div className="mx-auto max-w-3xl">
              {/* 标题 */}
              <h2 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                {section.title}
              </h2>
              
              {/* 描述 */}
              <p className="text-lg md:text-xl text-white/90 [.dark_&]:text-white/80 max-w-2xl mx-auto leading-relaxed">
                {section.description}
              </p>

              {/* 按钮组 */}
              {section.buttons && (
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                  {section.buttons.map((item, idx) => (
                    <Button 
                      key={idx} 
                      variant={item.variant || "default"}
                      className={`group relative overflow-hidden px-8 py-6 text-base font-semibold transition-all duration-300 ${
                        idx === 0 
                          ? 'bg-white text-green-600 hover:bg-white/90 [.dark_&]:bg-white [.dark_&]:text-green-700 [.dark_&]:hover:bg-white/90 shadow-2xl shadow-black/20'
                          : 'bg-white/20 text-white border-2 border-white/30 hover:bg-white/30 [.dark_&]:bg-white/10 [.dark_&]:border-white/20 [.dark_&]:hover:bg-white/20 backdrop-blur-sm'
                      }`}
                    >
                      <Link
                        href={item.url || ""}
                        target={item.target}
                        className="relative z-10 flex items-center justify-center gap-2"
                      >
                        {item.title}
                        {item.icon && (
                          <Icon name={item.icon as string} className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        )}
                      </Link>
                      
                      {/* 悬停效果 */}
                      {idx === 0 && (
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}
                    </Button>
                  ))}
                </div>
              )}

              {/* 底部装饰文字 */}
              <div className="mt-12 flex items-center justify-center gap-8 text-white/70 [.dark_&]:text-white/60">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" />
                  <span className="text-sm">Fast Response</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse [animation-delay:1s]" />
                  <span className="text-sm">Expert Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse [animation-delay:2s]" />
                  <span className="text-sm">Innovation</span>
                </div>
              </div>
            </div>
          </div>

          {/* 边框光效 */}
          <div className="absolute inset-0 rounded-3xl">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-400 via-cyan-400 to-green-400 opacity-50 blur-sm" />
            <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-green-500/90 via-cyan-500/90 to-green-500/90 [.dark_&]:from-green-600/80 [.dark_&]:via-cyan-600/80 [.dark_&]:to-green-600/80" />
          </div>
        </div>
      </div>
    </section>
  );
}