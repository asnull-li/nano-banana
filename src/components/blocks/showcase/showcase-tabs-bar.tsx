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
  const isDark = mounted && resolvedTheme === "dark";
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full flex justify-center mb-12">
      <div
        className={`inline-flex p-1.5 rounded-2xl ${
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
              width: `${100 / tabs.length}%`,
              left: `${(activeTab * 100) / tabs.length}%`,
            }}
          >
            <div className="h-full w-full rounded-xl bg-gradient-to-r from-green-500 to-cyan-500 shadow-lg" />
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
                relative z-10 px-8 py-3 text-sm font-medium rounded-xl
                transition-all duration-300 min-w-[200px] text-center
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
  );
}