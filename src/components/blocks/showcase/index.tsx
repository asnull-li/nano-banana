"use client";

import { useState, useEffect } from "react";
import { Section as SectionType } from "@/types/blocks/section";
import ShowcaseDisplay from "./showcase-display";
import ShowcaseTabsBar from "./showcase-tabs-bar";
import { useTheme } from "next-themes";
import { ShowcaseItem } from "./types";

interface ShowcaseSection extends SectionType {
  items?: ShowcaseItem[];
}

export default function Showcase({ section }: { section: ShowcaseSection }) {
  if (section.disabled) {
    return null;
  }

  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const isDark = mounted && resolvedTheme === "dark";
  const items = section.items || [];
  const currentItem = items[currentItemIndex];

  useEffect(() => {
    setMounted(true);
    setIsVisible(true);
  }, []);

  const handleTabChange = (index: number) => {
    setCurrentItemIndex(index);
  };

  const tabs = items.map((item) => ({
    id: item.id,
    label: item.category,
  }));

  return (
    <section
      id="showcase"
      className="relative min-h-screen py-20 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-cyan-500/5 opacity-30" />

      <div className="container relative z-10">
        <div
          className={`mx-auto mb-12 text-center transition-all duration-1000 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-10"
          }`}
        >
          <h1 className="mb-6 text-4xl font-bold lg:text-6xl">
            <span
              className={`bg-gradient-to-br bg-clip-text text-transparent ${
                isDark ? "from-white to-gray-300" : "from-gray-900 to-gray-700"
              }`}
            >
              {section.title}
            </span>
          </h1>
          <p
            className={`mx-auto max-w-2xl text-lg leading-relaxed ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {section.description}
          </p>
        </div>

        {/* Category Tabs Bar */}
        <div
          className={`transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          <ShowcaseTabsBar
            tabs={tabs}
            activeTab={currentItemIndex}
            onTabChange={handleTabChange}
          />
        </div>

        {/* Main Content Area */}
        {currentItem && (
          <div
            className={`transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            <div className="mb-8 text-center">
              <h3
                className={`text-2xl font-semibold mb-2 ${
                  isDark ? "text-gray-100" : "text-gray-900"
                }`}
              >
                {currentItem.title}
              </h3>
              <p
                className={` mx-auto ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {currentItem.description}
              </p>
            </div>

            <ShowcaseDisplay item={currentItem} />
          </div>
        )}
      </div>
    </section>
  );
}
