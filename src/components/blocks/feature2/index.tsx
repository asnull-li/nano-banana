import { Badge } from "@/components/ui/badge";
import Icon from "@/components/icon";
import { Section as SectionType } from "@/types/blocks/section";
import "./styles.css";

export default function Feature2({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null;
  }

  return (
    <section
      id={section.name}
      className="relative py-20 lg:py-32 overflow-hidden"
      aria-labelledby={`${section.name}-title`}
    >
      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: section.title,
            description: section.description,
            numberOfItems: section.items?.length || 0,
            itemListElement:
              section.items?.map((item, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: item.title,
                description: item.description,
                image: item.image?.src,
              })) || [],
          }),
        }}
      />

      <div className="container">
        <div className="mx-auto grid gap-12 lg:gap-20 lg:grid-cols-2 items-center">
          {/* 内容区域 */}
          <article className="space-y-8">
            {/* 标签和标题 */}
            <header className="space-y-4">
              {section.label && (
                <Badge className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 [.dark_&]:from-green-400/20 [.dark_&]:to-cyan-400/20 text-green-700 [.dark_&]:text-green-300 border-green-500/30 [.dark_&]:border-green-400/40 px-4 py-1">
                  {section.label}
                </Badge>
              )}
              <h2
                id={`${section.name}-title`}
                className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 [.dark_&]:from-white [.dark_&]:via-slate-100 [.dark_&]:to-white bg-clip-text text-transparent leading-tight"
              >
                {section.title}
              </h2>
              <p className="text-lg lg:text-xl text-slate-600 [.dark_&]:text-slate-300 leading-relaxed">
                {section.description}
              </p>
            </header>

            {/* 功能列表 - SEO 友好的结构 */}
            <div
              className="space-y-4"
              role="tablist"
              aria-label={section.title}
            >
              {section.items?.map((item, i) => (
                <details
                  key={i}
                  className="group rounded-xl bg-gradient-to-r from-white/60 to-slate-50/40 [.dark_&]:from-slate-800/40 [.dark_&]:to-slate-900/30 backdrop-blur-sm border border-slate-200/60 [.dark_&]:border-slate-700/50 open:border-green-500/40 [.dark_&]:open:border-green-400/60 transition-all duration-300 overflow-hidden"
                  {...(i === 0 ? { open: true } : {})}
                >
                  <summary className="px-6 py-4 cursor-pointer list-none hover:text-green-600 [.dark_&]:hover:text-green-400 group-open:text-green-600 [.dark_&]:group-open:text-green-400 transition-colors [&::-webkit-details-marker]:hidden">
                    <div className="flex items-center gap-4">
                      {item.icon && (
                        <div className="relative flex-shrink-0">
                          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-cyan-500 [.dark_&]:from-green-400 [.dark_&]:to-cyan-400 rounded-lg blur-md opacity-0 group-open:opacity-50 [.dark_&]:group-open:opacity-60 transition-opacity" />
                          <div className="relative w-10 h-10 bg-gradient-to-br from-green-500/10 to-cyan-500/10 [.dark_&]:from-green-400/20 [.dark_&]:to-cyan-400/20 group-open:from-green-500 group-open:to-cyan-500 [.dark_&]:group-open:from-green-400 [.dark_&]:group-open:to-cyan-400 rounded-lg flex items-center justify-center transition-all duration-300">
                            <Icon
                              name={item.icon}
                              className="w-5 h-5 text-green-600 [.dark_&]:text-green-400 group-open:text-white transition-colors"
                            />
                          </div>
                        </div>
                      )}
                      <h3 className="font-semibold text-base lg:text-lg text-slate-800 [.dark_&]:text-slate-200 group-open:text-green-600 [.dark_&]:group-open:text-green-400 flex-1">
                        {item.title}
                      </h3>
                      <svg
                        className="w-5 h-5 text-slate-400 [.dark_&]:text-slate-500 group-open:rotate-180 transition-transform duration-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </summary>
                  <div className="px-6 pb-4 animate-fade-in">
                    <div className="pl-14 space-y-4">
                      <p className="text-slate-600 [.dark_&]:text-slate-300 lg:text-base leading-relaxed">
                        {item.description}
                      </p>
                      {/* 装饰性进度条 */}
                      <div className="h-1 bg-slate-200/50 [.dark_&]:bg-slate-700/50 rounded-full overflow-hidden">
                        <div className="h-full w-full bg-gradient-to-r from-green-500 to-cyan-500 [.dark_&]:from-green-400 [.dark_&]:to-cyan-400 rounded-full shadow-lg shadow-green-500/20 [.dark_&]:shadow-green-400/30" />
                      </div>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </article>

          {/* 图片展示区域 - SEO 友好 */}
          <aside className="relative" aria-label="功能展示图片">
            {/* 装饰边框 */}
            <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 via-cyan-500/20 to-green-500/20 [.dark_&]:from-green-400/30 [.dark_&]:via-cyan-400/30 [.dark_&]:to-green-400/30 rounded-2xl blur-xl opacity-60" />

            <div className="relative">
              {/* 角落装饰 */}
              <div className="absolute -top-3 -right-3 w-20 h-20 border-t-2 border-r-2 border-green-500/40 [.dark_&]:border-green-400/60 rounded-tr-2xl" />
              <div className="absolute -bottom-3 -left-3 w-20 h-20 border-b-2 border-l-2 border-cyan-500/40 [.dark_&]:border-cyan-400/60 rounded-bl-2xl" />

              {/* 主要展示图片 */}
              {section.items && section.items[0] && (
                <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-slate-100/50 to-white/30 [.dark_&]:from-slate-900/50 [.dark_&]:to-slate-800/30 backdrop-blur-sm p-2">
                  <img
                    src={section.items[0].image?.src}
                    alt={section.items[0].image?.alt || section.items[0].title}
                    className="w-full h-auto object-cover rounded-lg"
                    loading="lazy"
                    width={600}
                    height={400}
                  />
                  {/* 图片遮罩效果 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
                </div>
              )}

              {/* 隐藏的其他图片用于 SEO */}
              <div className="sr-only">
                {section.items?.slice(1).map((item, i) => (
                  <img
                    key={i + 1}
                    src={item.image?.src}
                    alt={item.image?.alt || item.title}
                    loading="lazy"
                  />
                ))}
              </div>

              {/* 图片数量指示器 */}
              {section.items && section.items.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/50 [.dark_&]:bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-xs font-medium text-white">
                    1 / {section.items.length}
                  </span>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
