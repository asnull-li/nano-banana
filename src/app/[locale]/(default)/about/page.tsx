import { getAboutPage } from "@/services/page";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/about`;

  if (locale !== "en") {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/about`;
  }

  return {
    title: "About Nano Banana | 关于我们",
    description: "Learn about Nano Banana's mission, vision, and our commitment to climate action.",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await getAboutPage(locale);
  const { about } = page;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 科技感背景装饰 */}
      <div className="absolute inset-0 -z-10">
        {/* 动态粒子效果 */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-2 h-2 bg-green-500/40 [.dark_&]:bg-green-400/60 rounded-full animate-ping" />
          <div className="absolute top-40 right-20 w-3 h-3 bg-cyan-500/40 [.dark_&]:bg-cyan-400/60 rounded-full animate-ping [animation-delay:1s]" />
          <div className="absolute bottom-32 left-1/3 w-2 h-2 bg-green-500/40 [.dark_&]:bg-green-400/60 rounded-full animate-ping [animation-delay:2s]" />
          <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-cyan-500/30 [.dark_&]:bg-cyan-400/50 rounded-full animate-ping [animation-delay:3s]" />
        </div>

        {/* 主渐变光效 */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-green-500/10 via-transparent to-transparent [.dark_&]:from-green-400/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-cyan-500/10 via-transparent to-transparent [.dark_&]:from-cyan-400/15 rounded-full blur-3xl" />

        {/* 动态光线 */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.08),transparent_50%)] [.dark_&]:bg-[radial-gradient(ellipse_at_top_right,rgba(74,222,128,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.08),transparent_50%)] [.dark_&]:bg-[radial-gradient(ellipse_at_bottom_left,rgba(34,211,238,0.12),transparent_50%)]" />
      </div>

      <section className="relative py-20 lg:py-32">
        <div className="container max-w-4xl mx-auto px-4">
          {/* 标题区域 */}
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 [.dark_&]:from-white [.dark_&]:via-slate-100 [.dark_&]:to-white bg-clip-text text-transparent mb-4">
              {about.title}
            </h1>
            {about.subtitle && (
              <p className="text-xl text-green-600 [.dark_&]:text-green-400 font-semibold">
                {about.subtitle}
              </p>
            )}
          </div>

          {/* 内容区域 */}
          <div className="space-y-12">
            {/* 公司介绍 */}
            <div className="prose prose-lg max-w-none">
              <div className="bg-white/60 [.dark_&]:bg-slate-800/40 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 [.dark_&]:border-slate-700/60">
                <p className="text-slate-700 [.dark_&]:text-slate-300 leading-relaxed mb-6">
                  {about.paragraph1}
                </p>
                <p className="text-slate-700 [.dark_&]:text-slate-300 leading-relaxed">
                  {about.paragraph2}
                </p>
              </div>
            </div>

            {/* 环保承诺 - 重点突出 */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-cyan-500 to-green-500 [.dark_&]:from-green-400 [.dark_&]:via-cyan-400 [.dark_&]:to-green-400 rounded-2xl blur-sm opacity-60 animate-pulse" />
              <div className="relative bg-gradient-to-br from-green-50 to-cyan-50 [.dark_&]:from-slate-800/60 [.dark_&]:to-slate-900/60 backdrop-blur-sm rounded-2xl p-8 border border-green-200 [.dark_&]:border-green-700/60">
                <h2 className="text-2xl font-bold text-green-800 [.dark_&]:text-green-300 mb-4 flex items-center">
                  <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  {about.climateTitle}
                </h2>
                <p className="text-slate-700 [.dark_&]:text-slate-300 leading-relaxed mb-6 text-lg">
                  {about.paragraph3}
                </p>
                <a
                  href="https://climate.stripe.com/AoIcTh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-cyan-600 [.dark_&]:from-green-500 [.dark_&]:to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/30 [.dark_&]:hover:shadow-green-400/40 transition-all duration-300 hover:-translate-y-0.5"
                >
                  {about.climateButton}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>

            {/* 联系我们 */}
            <div className="bg-white/60 [.dark_&]:bg-slate-800/40 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 [.dark_&]:border-slate-700/60">
              <h2 className="text-2xl font-bold text-slate-900 [.dark_&]:text-white mb-4">
                {about.contactTitle}
              </h2>
              <p className="text-slate-700 [.dark_&]:text-slate-300 leading-relaxed mb-4">
                {about.paragraph4}
              </p>
              <a
                href={`mailto:${about.email}`}
                className="inline-flex items-center gap-2 text-lg font-semibold text-green-600 [.dark_&]:text-green-400 hover:text-green-700 [.dark_&]:hover:text-green-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {about.email}
              </a>
            </div>
          </div>

          {/* 底部装饰 */}
          <div className="mt-20 text-center">
            <div className="inline-block">
              <div className="flex items-center gap-2 text-sm text-slate-500 [.dark_&]:text-slate-400">
                <span className="w-12 h-[1px] bg-gradient-to-r from-transparent to-slate-300 [.dark_&]:to-slate-600" />
                <span>Nano Banana</span>
                <span className="w-12 h-[1px] bg-gradient-to-l from-transparent to-slate-300 [.dark_&]:to-slate-600" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}