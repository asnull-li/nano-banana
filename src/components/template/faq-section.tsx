interface FaqItem {
  question: string;
  answer: string;
}

interface FaqContact {
  question_text?: string;
  support_link?: string;
}

interface FaqData {
  title: string;
  description: string;
  items?: FaqItem[];
  contact?: FaqContact;
}

interface FaqSectionProps {
  pageData?: {
    faq?: FaqData;
  };
}

export default function FaqSection({ pageData }: FaqSectionProps) {
  const faqData = pageData?.faq;

  if (!faqData) {
    return null;
  }

  return (
    <section className="relative py-16 lg:py-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-8 w-80 h-80 bg-green-500/6 rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-8 w-96 h-96 bg-cyan-500/6 rounded-full blur-3xl" />

        {/* Decorative Lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.15] dark:opacity-[0.25]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="faq-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className="[stop-color:#10b981] [stop-opacity:0.1]" />
              <stop offset="100%" className="[stop-color:#06b6d4] [stop-opacity:0.1]" />
            </linearGradient>
          </defs>
          <path d="M0,200 Q400,100 800,200 T1600,200" stroke="url(#faq-gradient)" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <div className="container relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <h2 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold">
            <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
              {faqData.title}
            </span>
          </h2>
          <p className="text-base lg:text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            {faqData.description}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="flex flex-col gap-6 lg:gap-8 max-w-4xl mx-auto">
          {faqData.items?.map((item, index) => (
            <div key={index} className="group relative">
              {/* Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-cyan-500 dark:from-green-400 dark:to-cyan-400 rounded-2xl opacity-0 group-hover:opacity-20 blur-sm transition-all duration-500" />

              {/* Main Card */}
              <div className="relative bg-gradient-to-br from-white/85 to-slate-50/65 dark:from-slate-800/65 dark:to-slate-900/55 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-6 lg:p-8 transition-all duration-300 group-hover:border-green-500/30 dark:group-hover:border-green-400/50 group-hover:shadow-xl group-hover:shadow-green-500/10 dark:group-hover:shadow-green-400/20">
                <div className="flex gap-4 lg:gap-6">
                  {/* Question Number */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-cyan-500 dark:from-green-400 dark:to-cyan-400 rounded-xl blur opacity-50 group-hover:opacity-70 transition-opacity" />
                      <div className="relative w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-green-500/20 to-cyan-500/20 dark:from-green-400/30 dark:to-cyan-400/30 group-hover:from-green-500 group-hover:to-cyan-500 dark:group-hover:from-green-400 dark:group-hover:to-cyan-400 rounded-xl flex items-center justify-center transition-all duration-300">
                        <span className="text-sm lg:text-base font-bold text-green-600 dark:text-green-400 group-hover:text-white transition-colors">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    {/* Question */}
                    <h3 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors leading-tight">
                      {item.question}
                    </h3>

                    {/* Answer */}
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed m-0">{item.answer}</p>
                    </div>
                  </div>

                  {/* Decorative Icon */}
                  <div className="flex-shrink-0 self-start opacity-40 group-hover:opacity-70 transition-all duration-300">
                    <svg className="w-6 h-6 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Corner Decoration */}
                <div className="absolute top-0 right-0 w-16 h-16 opacity-5 group-hover:opacity-10 transition-opacity">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path
                      d="M100,0 L100,100 L0,100"
                      className="stroke-green-500 dark:stroke-green-400"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>

                {/* Bottom Accent */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500/40 to-transparent dark:via-green-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Contact */}
        <div className="mt-12 lg:mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-8 py-4 rounded-2xl bg-gradient-to-r from-green-500/5 to-cyan-500/5 dark:from-green-400/10 dark:to-cyan-400/10 border border-green-500/20 dark:border-green-400/30">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {faqData.contact?.question_text || 'Have more questions?'}
              </span>
            </div>
            <a
              href="mailto:support@nanobanana.org"
              className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-semibold transition-colors flex items-center gap-1"
            >
              {faqData.contact?.support_link || 'Contact our support team'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
