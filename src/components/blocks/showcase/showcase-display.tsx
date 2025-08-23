"use client";

import { useState, useEffect } from "react";
// import Image from "next/image";
import { useTheme } from "next-themes";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { ShowcaseItem } from "./types";

interface ShowcaseDisplayProps {
  item: ShowcaseItem;
}

export default function ShowcaseDisplay({ item }: ShowcaseDisplayProps) {
  const [currentEffectIndex, setCurrentEffectIndex] = useState(0);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const isDark = mounted && resolvedTheme === "dark";
  const currentEffect = item.effects[currentEffectIndex];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrevEffect = () => {
    setCurrentEffectIndex((prev) =>
      prev === 0 ? item.effects.length - 1 : prev - 1
    );
  };

  const handleNextEffect = () => {
    setCurrentEffectIndex((prev) => (prev + 1) % item.effects.length);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Left: Original Image */}
      <div className="relative  rounded-2xl overflow-hidden">
        <img
          src={item.original}
          alt="Original"
          className="w-full h-full object-cover"
        />
        {/* Before Badge */}
        <div className="absolute top-4 left-4">
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm ${
              isDark
                ? "bg-gray-900/80 text-gray-300 border border-gray-700"
                : "bg-white/80 text-gray-700 border border-gray-200"
            }`}
          >
            Before
          </span>
        </div>
      </div>

      {/* Right: AI Effects Carousel */}
      <div className="relative  rounded-2xl overflow-hidden">
        <img
          src={currentEffect.image}
          alt={currentEffect.name}
          className="w-full h-full object-cover"
        />

        {/* AI Badge */}
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-500 to-cyan-500 text-white backdrop-blur-sm">
            <Sparkles className="w-3 h-3" />
            AI
          </span>
        </div>

        {/* Bottom Prompt Bar with Navigation - Compact */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="relative flex items-center justify-between rounded-xl bg-gray-900/30 backdrop-blur px-4 py-2.5 ">
            {/* Previous Button */}
            <button
              onClick={handlePrevEffect}
              className="p-1.5 rounded-lg transition-all bg-gray-900/30 hover:bg-white/10 text-white/60 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Prompt Text */}
            <p className="text-white/90 text-xs font-medium text-center flex-1 px-3 truncate">
              {currentEffect.prompt}
            </p>

            {/* Next Button */}
            <button
              onClick={handleNextEffect}
              className="p-1.5 rounded-lg transition-all bg-gray-900/30 hover:bg-white/10 text-white/60 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Effect Indicators - Below the prompt bar */}
          <div className="flex justify-center gap-1.5 mt-2">
            {item.effects.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentEffectIndex(index)}
                className={`transition-all ${
                  index === currentEffectIndex
                    ? "w-6 h-1.5 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full"
                    : "w-1.5 h-1.5 rounded-full bg-white/25 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
