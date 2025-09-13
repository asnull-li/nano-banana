import "./bg.css";

export default function HeroBg() {
  return (
    <>
      {/* 主背景渐变 */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-black dark:via-gray-950 dark:to-black transition-colors duration-500" />

      {/* 动态颜色圆圈 */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] hero-spin-slow">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl bg-green-500/10 dark:bg-green-500/5 transition-all duration-500" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full blur-3xl bg-cyan-500/10 dark:bg-cyan-500/5 transition-all duration-500" />
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 rounded-full blur-3xl bg-emerald-500/10 dark:bg-emerald-500/5 transition-all duration-500" />
        </div>
      </div>

      {/* 网格背景 */}
      <div className="fixed inset-0 -z-10">
        <svg className="absolute inset-0 w-full h-full opacity-10 dark:opacity-5 transition-opacity duration-500">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-gray-400 dark:text-gray-600"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* 扫描线效果 */}
      <div className="fixed top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500/50 dark:via-green-500/30 to-transparent hero-scan-line" />
    </>
  );
}
