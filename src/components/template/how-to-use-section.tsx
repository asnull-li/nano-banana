interface HowToUseStep {
  title: string;
  description: string;
}

interface HowToUseData {
  title: string;
  description: string;
  items?: HowToUseStep[];
}

interface HowToUseSectionProps {
  pageData?: {
    how_to_use?: HowToUseData;
  };
}

export default function HowToUseSection({ pageData }: HowToUseSectionProps) {
  const howToUseData = pageData?.how_to_use;

  if (!howToUseData) {
    return null;
  }

  return (
    <section className="relative py-16 lg:py-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-16 w-64 h-64 bg-cyan-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-16 w-80 h-80 bg-green-500/8 rounded-full blur-3xl" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />
        </div>
      </div>

      <div className="container relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <h2 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold">
            <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
              {howToUseData.title}
            </span>
          </h2>
          <p className="text-base lg:text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            {howToUseData.description}
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
            {/* Connection Lines (hidden on mobile) */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-px">
              <div className="relative h-full">
                <div className="absolute inset-y-0 left-1/3 right-1/3 bg-gradient-to-r from-green-500/30 via-cyan-500/50 to-green-500/30 dark:from-green-400/40 dark:via-cyan-400/60 dark:to-green-400/40" />
              </div>
            </div>

            {howToUseData.items?.map((item, index) => (
              <div key={index} className="relative group">
                {/* Step Card */}
                <div className="relative p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-white/90 to-slate-50/70 dark:from-slate-800/70 dark:to-slate-900/60 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/50 hover:border-green-500/40 dark:hover:border-green-400/60 transition-all duration-500 hover:shadow-xl hover:shadow-green-500/15 dark:hover:shadow-green-400/25 hover:-translate-y-2">
                  {/* Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-cyan-500 dark:from-green-400 dark:to-cyan-400 rounded-2xl opacity-0 group-hover:opacity-25 blur-lg transition-all duration-500" />

                  {/* Step Number */}
                  <div className="relative mb-6 flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-cyan-500 dark:from-green-400 dark:to-cyan-400 rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-opacity animate-pulse" />
                      <div className="relative w-16 h-16 bg-gradient-to-br from-green-500 to-cyan-500 dark:from-green-400 dark:to-cyan-400 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-2xl font-bold text-white">{index + 1}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 text-center">
                    <h3 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Decorative Corner */}
                  <div className="absolute top-4 right-4 w-12 h-12 opacity-10 group-hover:opacity-20 transition-opacity">
                    <svg viewBox="0 0 50 50" className="w-full h-full">
                      <path
                        d="M50,0 L50,50 L0,50"
                        className="stroke-green-500 dark:stroke-green-400"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                  </div>
                </div>

                {/* Arrow (visible only between steps on desktop) */}
                {howToUseData.items && index < howToUseData.items.length - 1 && (
                  <div className="hidden md:block absolute top-24 -right-6 lg:-right-8 z-20">
                    <div className="w-12 h-8 flex items-center justify-center">
                      <svg
                        className="w-8 h-6 text-green-500/60 dark:text-green-400/70 group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 lg:mt-16 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-500/10 to-cyan-500/10 dark:from-green-400/20 dark:to-cyan-400/20 border border-green-500/20 dark:border-green-400/30">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                Start enhancing your images now
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
