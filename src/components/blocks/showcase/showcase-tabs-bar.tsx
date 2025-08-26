"use client";

import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";

interface TabItem {
  id: string;
  label: string;
}

interface ShowcaseTabsBarProps {
  tabs: TabItem[];
  activeTab: number;
  onTabChange: (index: number) => void;
}

export default function ShowcaseTabsBar({
  tabs,
  activeTab,
  onTabChange,
}: ShowcaseTabsBarProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const isDark = mounted && resolvedTheme === "dark";
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (tabRefs.current[activeTab] && scrollContainerRef.current) {
      const tab = tabRefs.current[activeTab];
      const container = scrollContainerRef.current;
      
      const tabLeft = tab.offsetLeft;
      const tabWidth = tab.offsetWidth;
      const containerWidth = container.offsetWidth;
      const scrollLeft = container.scrollLeft;
      
      if (tabLeft < scrollLeft) {
        container.scrollTo({
          left: tabLeft - 20,
          behavior: "smooth"
        });
      } else if (tabLeft + tabWidth > scrollLeft + containerWidth) {
        container.scrollTo({
          left: tabLeft + tabWidth - containerWidth + 20,
          behavior: "smooth"
        });
      }
    }
  }, [activeTab]);

  useEffect(() => {
    const checkScroll = () => {
      if (!scrollContainerRef.current) return;
      const container = scrollContainerRef.current;
      
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      );
      
      setShowScrollHint(container.scrollWidth > container.clientWidth);
    };

    checkScroll();
    
    const container = scrollContainerRef.current;
    container?.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    
    return () => {
      container?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [tabs]);

  return (
    <div className="w-full mb-12 px-4 sm:px-6 lg:px-8">
      <div className="relative max-w-full flex justify-center">
        {/* Left Scroll Indicator */}
        {showScrollHint && canScrollLeft && (
          <div className={`absolute left-0 top-0 bottom-0 w-8 z-20 pointer-events-none
            bg-gradient-to-r ${isDark ? "from-gray-950" : "from-white"} to-transparent`} 
          />
        )}
        
        {/* Right Scroll Indicator */}
        {showScrollHint && canScrollRight && (
          <div className={`absolute right-0 top-0 bottom-0 w-8 z-20 pointer-events-none
            bg-gradient-to-l ${isDark ? "from-gray-950" : "from-white"} to-transparent`}
          />
        )}

        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide scroll-smooth max-w-full"
        >
          <div
            className={`inline-flex p-1 sm:p-1.5 rounded-xl sm:rounded-2xl ${
              isDark 
                ? "bg-gray-900/95 backdrop-blur-xl border border-gray-800" 
                : "bg-gray-100/95 backdrop-blur-xl border border-gray-200"
            }`}
          >
            <div className="relative flex">
              {/* Sliding Background */}
              <div
                className="absolute h-full transition-all duration-500 ease-out pointer-events-none"
                style={{
                  width: tabRefs.current[activeTab]?.offsetWidth || 0,
                  left: tabRefs.current[activeTab]?.offsetLeft || 0,
                }}
              >
                <div className="h-full w-full rounded-lg sm:rounded-xl bg-gradient-to-r from-green-500 to-cyan-500 shadow-lg" />
              </div>

              {/* Tab Items */}
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  onClick={() => onTabChange(index)}
                  className={`
                    relative z-10 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 
                    text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl
                    transition-all duration-300 whitespace-nowrap
                    min-w-[100px] sm:min-w-[140px] md:min-w-[180px] text-center
                    ${
                      index === activeTab
                        ? "text-white"
                        : isDark
                        ? "text-gray-400 hover:text-gray-200"
                        : "text-gray-600 hover:text-gray-800"
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}