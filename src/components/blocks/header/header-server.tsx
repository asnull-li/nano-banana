import { Header as HeaderType } from "@/types/blocks/header";
import Icon from "@/components/icon";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export default function HeaderServer({ header }: { header: HeaderType }) {
  if (header.disabled) {
    return null;
  }

  return (
    <section className="fixed top-0 left-0 right-0 z-40 py-4 bg-white/60 [.dark_&]:bg-slate-950/60 backdrop-blur-lg">
      {/* 顶部装饰线 */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent [.dark_&]:via-green-400/60" />

      <div className="w-full px-4 md:px-6 lg:px-8">
        {/* PC 端导航 - 静态 HTML 给 SEO */}
        <nav className="hidden justify-between lg:flex">
          <div className="flex items-center gap-6">
            <Link
              href={(header.brand?.url as any) || "/"}
              className="group flex items-center gap-2 transition-transform hover:scale-105"
            >
              {header.brand?.logo?.src && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-cyan-500 [.dark_&]:from-green-400 [.dark_&]:to-cyan-400 rounded-lg blur-md opacity-0 group-hover:opacity-50 transition-opacity" />
                  <img
                    src={header.brand.logo.src}
                    alt={header.brand.logo.alt || header.brand.title}
                    className="relative w-8 h-8"
                  />
                </div>
              )}
              {header.brand?.title && (
                <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-cyan-600 [.dark_&]:from-green-400 [.dark_&]:to-cyan-400 bg-clip-text text-transparent">
                  {header.brand?.title || ""}
                </span>
              )}
            </Link>

            {/* 静态菜单结构 - SEO 友好 */}
            <div className="flex items-center gap-2">
              {header.nav?.items?.map((item, i) => (
                <div key={i} className="relative group">
                  {item.children && item.children.length > 0 ? (
                    <>
                      <div className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 [.dark_&]:text-slate-300 hover:text-green-600 [.dark_&]:hover:text-green-400 cursor-pointer">
                        {item.icon && (
                          <Icon name={item.icon} className="size-4 shrink-0 mr-2" />
                        )}
                        <span>{item.title}</span>
                        {item.is_new && (
                          <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-500 [.dark_&]:bg-red-600 rounded-full animate-pulse">
                            NEW
                          </span>
                        )}
                        <ChevronDown className="size-4 ml-1 transition-transform group-hover:rotate-180" />
                      </div>
                      {/* 静态下拉菜单 - 默认隐藏,SEO 可见 */}
                      <div className="absolute left-0 top-full pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity">
                        <div className="grid w-[600px] gap-3 p-4 grid-cols-2 bg-white [.dark_&]:bg-slate-950 backdrop-blur-xl border border-slate-200 [.dark_&]:border-slate-800 rounded-lg shadow-xl">
                          {item.children.map((iitem, ii) => (
                            <Link
                              key={ii}
                              href={iitem.url as any}
                              target={iitem.target}
                              className={cn(
                                "group/item block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-colors hover:bg-gradient-to-br hover:from-green-50 hover:to-cyan-50 [.dark_&]:hover:from-green-950/50 [.dark_&]:hover:to-cyan-950/50 hover:shadow-md border border-transparent hover:border-green-200 [.dark_&]:hover:border-green-800"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                {iitem.icon && (
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-100 to-cyan-100 [.dark_&]:from-green-900/30 [.dark_&]:to-cyan-900/30 group-hover/item:from-green-200 group-hover/item:to-cyan-200 [.dark_&]:group-hover/item:from-green-800/50 [.dark_&]:group-hover/item:to-cyan-800/50 transition-colors">
                                    <Icon
                                      name={iitem.icon}
                                      className="size-5 text-green-600 [.dark_&]:text-green-400"
                                    />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <div className="text-sm font-semibold text-slate-900 [.dark_&]:text-slate-100 group-hover/item:text-green-600 [.dark_&]:group-hover/item:text-green-400 transition-colors flex items-center gap-1">
                                    {iitem.title}
                                    {iitem.is_new && (
                                      <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-500 [.dark_&]:bg-red-600 rounded-full animate-pulse">
                                        NEW
                                      </span>
                                    )}
                                  </div>
                                  <p className="line-clamp-2 text-xs leading-snug text-slate-500 [.dark_&]:text-slate-400">
                                    {iitem.description}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link
                      href={item.url as any}
                      target={item.target}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 [.dark_&]:text-slate-300 hover:text-green-600 [.dark_&]:hover:text-green-400 transition-colors rounded-md"
                    >
                      {item.icon && (
                        <Icon name={item.icon} className="size-4 shrink-0 mr-2" />
                      )}
                      {item.title}
                      {item.is_new && (
                        <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-500 [.dark_&]:bg-red-600 rounded-full animate-pulse">
                          NEW
                        </span>
                      )}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 右侧按钮区域 - 占位,实际交互由客户端组件处理 */}
          <div className="shrink-0 flex gap-2 items-center">
            {/* 预留给客户端组件 */}
          </div>
        </nav>

        {/* 移动端 - 静态 Logo */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            <Link
              href={(header.brand?.url || "/") as any}
              className="group flex items-center gap-2 transition-transform hover:scale-105"
            >
              {header.brand?.logo?.src && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-cyan-500 [.dark_&]:from-green-400 [.dark_&]:to-cyan-400 rounded-lg blur-md opacity-0 group-hover:opacity-50 transition-opacity" />
                  <img
                    src={header.brand.logo.src}
                    alt={header.brand.logo.alt || header.brand.title}
                    className="relative w-8 h-8"
                  />
                </div>
              )}
              {header.brand?.title && (
                <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-cyan-600 [.dark_&]:from-green-400 [.dark_&]:to-cyan-400 bg-clip-text text-transparent">
                  {header.brand?.title || ""}
                </span>
              )}
            </Link>
            {/* 移动端菜单按钮由客户端组件处理 */}
          </div>
        </div>
      </div>
    </section>
  );
}
