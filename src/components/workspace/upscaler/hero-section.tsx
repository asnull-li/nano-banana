interface HeroSectionProps {
  pageData?: any;
}

export default function HeroSection({ pageData }: HeroSectionProps) {
  return (
    <section className="relative py-12 lg:py-16 overflow-hidden">
      {/* Simple Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Title - Simple H1 */}
          <h1 className="mb-6 text-3xl sm:text-4xl lg:text-5xl font-bold">
            <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
              {pageData?.hero?.title || "Nano Banana Image Upscaler"}
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto max-w-2xl text-base lg:text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            {pageData?.hero?.description ||
              "Professional AI-powered image enhancement and upscaling technology for stunning visual results."}
          </p>
        </div>
      </div>
    </section>
  );
}
