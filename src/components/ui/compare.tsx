"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CompareProps {
  firstImage: string;
  secondImage: string;
  className?: string;
  slideMode?: "hover" | "drag";
  showHandlebar?: boolean;
  autoplay?: boolean;
  autoplayDuration?: number;
  firstImageClassName?: string;
  secondImageClassName?: string;
  initialSliderPercentage?: number;
  firstImageLabel?: string;
  secondImageLabel?: string;
}

export const Compare = ({
  firstImage,
  secondImage,
  className,
  slideMode = "hover",
  showHandlebar = true,
  autoplay = false,
  autoplayDuration = 5000,
  firstImageClassName,
  secondImageClassName,
  initialSliderPercentage = 50,
  firstImageLabel = "Before",
  secondImageLabel = "After",
}: CompareProps) => {
  const [sliderXPercent, setSliderXPercent] = useState(initialSliderPercentage);
  const [isDragging, setIsDragging] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);

  const [isMouseOver, setIsMouseOver] = useState(false);

  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoplay = useCallback(() => {
    if (!autoplay) return;

    const stopAutoplay = () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };

    const runAutoplay = () => {
      autoplayRef.current = setInterval(() => {
        setSliderXPercent((prev) => {
          const increment = 2;
          if (prev >= 95) {
            return 5;
          }
          return prev + increment;
        });
      }, autoplayDuration / 100);
    };

    runAutoplay();

    return stopAutoplay;
  }, [autoplay, autoplayDuration]);

  useEffect(() => {
    const stopAutoplay = startAutoplay();
    return () => {
      if (stopAutoplay) stopAutoplay();
    };
  }, [startAutoplay]);

  const handleStart = useCallback(
    (clientX: number) => {
      if (slideMode === "drag") {
        setIsDragging(true);
      }
    },
    [slideMode]
  );

  const handleEnd = useCallback(() => {
    if (slideMode === "drag") {
      setIsDragging(false);
    }
  }, [slideMode]);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return;
      if (slideMode === "hover" || (slideMode === "drag" && isDragging)) {
        const rect = sliderRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percent = (x / rect.width) * 100;
        setSliderXPercent(Math.max(0, Math.min(100, percent)));
      }
    },
    [slideMode, isDragging]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      handleStart(e.clientX);
      handleMove(e.clientX);
    },
    [handleStart, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      handleMove(e.clientX);
    },
    [handleMove]
  );

  const handleMouseEnter = useCallback(() => {
    setIsMouseOver(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsMouseOver(false);
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handleStart(e.touches[0].clientX);
      handleMove(e.touches[0].clientX);
    },
    [handleStart, handleMove]
  );

  const handleTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      handleMove(e.touches[0].clientX);
    },
    [handleMove]
  );

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (slideMode === "drag" && isDragging) {
        handleMove(e.clientX);
      }
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging, handleMove, slideMode]);

  return (
    <div
      ref={sliderRef}
      className={cn("w-[400px] h-[400px] overflow-hidden", className)}
      style={{
        position: "relative",
        cursor: slideMode === "drag" ? "grab" : "col-resize",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      <AnimatePresence>
        <motion.div
          className="h-full w-px absolute top-0 m-auto z-30 bg-gradient-to-b from-transparent from-[5%] to-transparent to-[95%] via-white shadow-lg"
          style={{
            left: `${sliderXPercent}%`,
            top: "0",
            zIndex: 40,
          }}
          transition={{ duration: 0 }}
        >
          <div className="w-10 h-10 absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 flex items-center justify-center bg-white rounded-full shadow-lg border-2 border-green-500/20 hover:border-green-500/50 transition-all duration-200">
            <div className="h-4 w-4 rounded-full bg-gradient-to-r from-green-500 to-cyan-500"></div>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="overflow-hidden w-full h-full relative z-20 pointer-events-none">
        <AnimatePresence>
          <motion.div
            className={cn("absolute inset-0 z-20 rounded-2xl", firstImageClassName)}
            style={{
              clipPath: `inset(0 ${100 - sliderXPercent}% 0 0)`,
            }}
            transition={{ duration: 0 }}
          >
            <img
              alt="first image"
              src={firstImage}
              className={cn(
                "absolute inset-0 z-20 rounded-2xl w-full h-full object-cover select-none",
                firstImageClassName
              )}
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="overflow-hidden w-full h-full absolute top-0 z-10">
        <AnimatePresence>
          <motion.div
            className={cn("absolute inset-0 z-10 rounded-2xl", secondImageClassName)}
            transition={{ duration: 0 }}
          >
            <img
              alt="second image"
              src={secondImage}
              className={cn(
                "absolute inset-0 z-10 rounded-2xl w-full h-full object-cover select-none",
                secondImageClassName
              )}
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 z-50">
        <div className={cn(
          "px-2 py-1 bg-black/70 text-white text-xs rounded-md transition-opacity duration-200",
          sliderXPercent < 20 ? "opacity-0" : "opacity-100"
        )}>
          {firstImageLabel}
        </div>
      </div>
      <div className="absolute top-3 right-3 z-50">
        <div className={cn(
          "px-2 py-1 bg-black/70 text-white text-xs rounded-md transition-opacity duration-200",
          sliderXPercent > 80 ? "opacity-0" : "opacity-100"
        )}>
          {secondImageLabel}
        </div>
      </div>
    </div>
  );
};