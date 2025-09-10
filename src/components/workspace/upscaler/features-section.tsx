interface FeaturesSectionProps {
  pageData?: any;
}

export default function FeaturesSection({ pageData }: FeaturesSectionProps) {
  const featuresData = pageData?.features;
  
  if (!featuresData) {
    return null;
  }

  return (
    <section className="relative py-16 lg:py-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-green-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-conic from-green-500/5 via-cyan-500/5 to-green-500/5 rounded-full blur-2xl" />
      </div>

      <div className="container relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <h2 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold">
            <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
              {featuresData.title}
            </span>
          </h2>
          <p className="text-base lg:text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            {featuresData.description}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {featuresData.items?.map((item: any, index: number) => (
            <div 
              key={index}
              className="group relative p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-white/80 to-slate-50/60 dark:from-slate-800/60 dark:to-slate-900/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/50 hover:border-green-500/30 dark:hover:border-green-400/50 transition-all duration-500 hover:shadow-xl hover:shadow-green-500/10 dark:hover:shadow-green-400/20 hover:-translate-y-1"
            >
              {/* Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-cyan-500 dark:from-green-400 dark:to-cyan-400 rounded-2xl opacity-0 group-hover:opacity-20 blur-sm transition-all duration-500" />
              
              {/* Content */}
              <div className="relative z-10">
                {/* Feature Number */}
                <div className="mb-4 inline-flex">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-cyan-500 dark:from-green-400 dark:to-cyan-400 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                    <div className="relative w-12 h-12 bg-gradient-to-br from-green-500/20 to-cyan-500/20 dark:from-green-400/30 dark:to-cyan-400/30 group-hover:from-green-500 group-hover:to-cyan-500 dark:group-hover:from-green-400 dark:group-hover:to-cyan-400 rounded-xl flex items-center justify-center transition-all duration-300">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400 group-hover:text-white transition-colors">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors leading-tight">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Bottom Accent Line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent dark:via-green-400/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}