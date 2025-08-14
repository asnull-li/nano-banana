import Icon from "@/components/icon";
import { Section as SectionType } from "@/types/blocks/section";

export default function Feature1({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null;
  }

  return (
    <section id={section.name} className="relative py-20 lg:py-32 overflow-hidden">
      {/* 科技感背景装饰 */}
      <div className="absolute inset-0 -z-10">
        {/* 粒子背景效果 */}
        <div className="absolute inset-0 overflow-hidden">
          {/* 浮动光点 */}
          <div className="absolute top-20 left-10 w-2 h-2 bg-green-500/40 [.dark_&]:bg-green-400/60 rounded-full animate-ping" />
          <div className="absolute top-40 right-20 w-3 h-3 bg-cyan-500/40 [.dark_&]:bg-cyan-400/60 rounded-full animate-ping [animation-delay:1s]" />
          <div className="absolute bottom-32 left-1/3 w-2 h-2 bg-green-500/40 [.dark_&]:bg-green-400/60 rounded-full animate-ping [animation-delay:2s]" />
          <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-cyan-500/30 [.dark_&]:bg-cyan-400/50 rounded-full animate-ping [animation-delay:3s]" />
          
          {/* 流动线条 */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className="[stop-color:#10b981] [stop-opacity:0.2]" />
                <stop offset="50%" className="[stop-color:#06b6d4] [stop-opacity:0.3]" />
                <stop offset="100%" className="[stop-color:#10b981] [stop-opacity:0.2]" />
              </linearGradient>
            </defs>
            <path
              d="M0,100 Q200,50 400,100 T800,100"
              className="stroke-current text-green-500/20 [.dark_&]:text-green-400/30"
              strokeWidth="2"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M0,200 Q300,150 600,200 T1200,200"
              className="stroke-current text-cyan-500/20 [.dark_&]:text-cyan-400/30"
              strokeWidth="2"
              fill="none"
              opacity="0.5"
            />
          </svg>

          {/* 六边形装饰 */}
          <div className="absolute top-10 right-10 w-32 h-32 opacity-10 [.dark_&]:opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon
                points="50,5 90,25 90,75 50,95 10,75 10,25"
                className="stroke-green-500 [.dark_&]:stroke-green-400"
                strokeWidth="1"
                fill="none"
              />
            </svg>
          </div>
          <div className="absolute bottom-20 left-20 w-24 h-24 opacity-10 [.dark_&]:opacity-20 rotate-12">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon
                points="50,5 90,25 90,75 50,95 10,75 10,25"
                className="stroke-cyan-500 [.dark_&]:stroke-cyan-400"
                strokeWidth="1"
                fill="none"
              />
            </svg>
          </div>
        </div>
        
        {/* 主渐变光效 */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-green-500/15 via-transparent to-transparent [.dark_&]:from-green-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-cyan-500/15 via-transparent to-transparent [.dark_&]:from-cyan-400/20 rounded-full blur-3xl" />
        
        {/* 动态光线 */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.1),transparent_50%)] [.dark_&]:bg-[radial-gradient(ellipse_at_top_right,rgba(74,222,128,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.1),transparent_50%)] [.dark_&]:bg-[radial-gradient(ellipse_at_bottom_left,rgba(34,211,238,0.15),transparent_50%)]" />
      </div>

      <div className="container relative">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* 图片区域 */}
          {section.image && (
            <div className="relative group">
              {/* 科技感边框 */}
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-cyan-500 to-green-500 [.dark_&]:from-green-400 [.dark_&]:via-cyan-400 [.dark_&]:to-green-400 rounded-xl blur-sm opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
              
              {/* 主图片容器 */}
              <div className="relative rounded-xl overflow-hidden bg-white/80 [.dark_&]:bg-slate-900/60 backdrop-blur-sm border border-slate-200/50 [.dark_&]:border-slate-700/50">
                <img
                  src={section.image?.src}
                  alt="placeholder hero"
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                
                {/* 扫描线效果 */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/10 to-transparent [.dark_&]:via-green-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>

              {/* 装饰元素 */}
              <div className="absolute -top-4 -right-4 w-24 h-24 border-t-2 border-r-2 border-green-500/40 [.dark_&]:border-green-400/60 rounded-tr-2xl" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 border-b-2 border-l-2 border-cyan-500/40 [.dark_&]:border-cyan-400/60 rounded-bl-2xl" />
            </div>
          )}

          {/* 内容区域 */}
          <div className="flex flex-col space-y-8">
            {/* 标题 */}
            {section.title && (
              <div className="space-y-2">
                <div className="inline-block">
                  <span className="inline-flex h-8 items-center rounded-full bg-gradient-to-r from-green-500/10 to-cyan-500/10 [.dark_&]:from-green-400/30 [.dark_&]:to-cyan-400/30 px-4 text-xs font-semibold text-green-700 [.dark_&]:text-green-300 backdrop-blur-sm border border-green-500/30 [.dark_&]:border-green-400/50">
                    ADVANCED FEATURES
                  </span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 [.dark_&]:from-white [.dark_&]:via-slate-100 [.dark_&]:to-white bg-clip-text text-transparent leading-tight">
                  {section.title}
                </h2>
              </div>
            )}

            {/* 描述 */}
            {section.description && (
              <p className="text-lg lg:text-xl text-slate-600 [.dark_&]:text-slate-300 leading-relaxed">
                {section.description}
              </p>
            )}

            {/* 特性列表 */}
            <ul className="space-y-6">
              {section.items?.map((item, i) => (
                <li
                  key={i}
                  className="group flex gap-4 p-4 rounded-xl bg-gradient-to-r from-white/60 to-slate-50/40 [.dark_&]:from-slate-800/50 [.dark_&]:to-slate-900/40 backdrop-blur-sm border border-slate-200/60 [.dark_&]:border-slate-700/60 hover:border-green-500/50 [.dark_&]:hover:border-green-400/70 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 [.dark_&]:hover:shadow-green-400/30"
                >
                  {/* 图标容器 */}
                  {item.icon && (
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-cyan-500 [.dark_&]:from-green-400 [.dark_&]:to-cyan-400 rounded-lg blur-md opacity-40 group-hover:opacity-60 [.dark_&]:opacity-60 [.dark_&]:group-hover:opacity-80 transition-opacity" />
                      <div className="relative w-12 h-12 bg-gradient-to-br from-green-500 to-cyan-500 [.dark_&]:from-green-400 [.dark_&]:to-cyan-400 rounded-lg flex items-center justify-center shadow-lg">
                        <Icon
                          name={item.icon}
                          className="w-6 h-6 text-white"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* 文本内容 */}
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900 [.dark_&]:text-white group-hover:text-green-600 [.dark_&]:group-hover:text-green-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm lg:text-base text-slate-600 [.dark_&]:text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* 悬停箭头 */}
                  <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-green-500 [.dark_&]:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}