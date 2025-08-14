import Icon from "@/components/icon";
import { Section as SectionType } from "@/types/blocks/section";

export default function Feature({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null;
  }

  return (
    <section id={section.name} className="relative py-20 lg:py-32 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 -z-10">
        {/* 圆形渐变 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px]">
          <div className="absolute inset-0 bg-gradient-conic from-green-500/10 via-cyan-500/10 to-green-500/10 [.dark_&]:from-green-400/20 [.dark_&]:via-cyan-400/20 [.dark_&]:to-green-400/20 rounded-full blur-3xl animate-spin [animation-duration:30s]" />
        </div>
        
        {/* 装饰点 */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/5 [.dark_&]:bg-green-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/5 [.dark_&]:bg-cyan-400/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative">
        {/* 标题区域 - 创新的侧边布局 */}
        <div className="grid lg:grid-cols-[1fr,2fr] gap-12 lg:gap-20 mb-16">
          <div className="lg:sticky lg:top-20 lg:self-start">
            <div className="inline-block mb-4">
              <span className="inline-flex h-8 items-center rounded-full bg-gradient-to-r from-green-500/10 to-cyan-500/10 [.dark_&]:from-green-400/20 [.dark_&]:to-cyan-400/20 px-4 text-xs font-semibold text-green-700 [.dark_&]:text-green-300 backdrop-blur-sm border border-green-500/20 [.dark_&]:border-green-400/30">
                CORE FEATURES
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-br from-slate-900 via-green-800 to-slate-900 [.dark_&]:from-white [.dark_&]:via-green-300 [.dark_&]:to-white bg-clip-text text-transparent leading-tight mb-6">
              {section.title}
            </h2>
            <p className="text-lg text-slate-600 [.dark_&]:text-slate-300 leading-relaxed">
              {section.description}
            </p>
            
            {/* 装饰线条 */}
            <div className="hidden lg:block mt-8">
              <svg className="w-full h-32" viewBox="0 0 200 100">
                <path
                  d="M0,50 Q50,20 100,50 T200,50"
                  className="stroke-green-500/20 [.dark_&]:stroke-green-400/30"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
          </div>

          {/* 特性卡片 - 交错布局 */}
          <div className="grid gap-6 md:grid-cols-2 auto-rows-min">
            {section.items?.map((item, i) => (
              <div
                key={i}
                className={`group relative flex flex-col p-6 rounded-2xl bg-gradient-to-br from-white/80 to-slate-50/60 [.dark_&]:from-slate-800/50 [.dark_&]:to-slate-900/40 backdrop-blur-sm border border-slate-200/60 [.dark_&]:border-slate-700/50 hover:border-green-500/30 [.dark_&]:hover:border-green-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/10 [.dark_&]:hover:shadow-green-400/20 hover:-translate-y-1 ${
                  i % 3 === 0 ? 'md:col-span-2' : ''
                }`}
              >
                {/* 悬停时的光效 */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 via-cyan-500/0 to-green-500/0 group-hover:from-green-500/5 group-hover:via-cyan-500/5 group-hover:to-green-500/5 [.dark_&]:group-hover:from-green-400/10 [.dark_&]:group-hover:via-cyan-400/10 [.dark_&]:group-hover:to-green-400/10 rounded-2xl transition-all duration-500" />
                
                <div className="relative z-10">
                  {/* 图标 */}
                  {item.icon && (
                    <div className="mb-4 inline-flex">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-cyan-500 [.dark_&]:from-green-400 [.dark_&]:to-cyan-400 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                        <div className="relative w-14 h-14 bg-gradient-to-br from-green-500 to-cyan-500 [.dark_&]:from-green-400 [.dark_&]:to-cyan-400 rounded-xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-500">
                          <Icon name={item.icon} className="w-7 h-7 text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* 内容 */}
                  <h3 className="text-xl font-semibold text-slate-900 [.dark_&]:text-white mb-3 group-hover:text-green-600 [.dark_&]:group-hover:text-green-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 [.dark_&]:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                  
                  {/* 卡片索引 */}
                  <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gradient-to-br from-green-500/10 to-cyan-500/10 [.dark_&]:from-green-400/20 [.dark_&]:to-cyan-400/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-green-600 [.dark_&]:text-green-400">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* 底部装饰线 */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent [.dark_&]:via-green-400/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}