interface HeroData {
  title?: string;
  subtitle?: string;
  description?: string;
}

interface HeroSectionProps {
  pageData?: {
    hero?: HeroData;
  };
}

export default function HeroSection({ pageData }: HeroSectionProps) {
  return (
    <section className="relative py-12 lg:py-20 overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl animate-pulse [animation-delay:0.5s]" />
      </div>

      <div className="container relative z-10">
        <div className="text-center mx-auto">
          {/* Title */}
          <h1 className="mb-4 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
              {pageData?.hero?.title || "Nano Banana"}
            </span>
          </h1>

          {/* Subtitle */}
          {pageData?.hero?.subtitle && (
            <div className="mb-6 flex items-center justify-center gap-2 flex-wrap">
              <p className="text-base sm:text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                {pageData.hero.subtitle}
              </p>
            </div>
          )}

          {/* Description */}
          <p className="mx-auto max-w-3xl text-lg lg:text-xl leading-relaxed text-gray-600 dark:text-gray-400 mb-8">
            {pageData?.hero?.description ||
              "Professional AI-powered technology for stunning results."}
          </p>
        </div>
      </div>
    </section>
  );
}
