"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Star, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export default function HappyUsers() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 5);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (count < 99) {
        setCount((prev) => prev + 1);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [count]);

  return (
    <div className="mx-auto mt-12 flex w-fit flex-col items-center gap-4 sm:flex-row p-6 rounded-2xl border border-gray-900/20 dark:border-white/20 bg-gradient-to-r from-gray-900/5 dark:from-white/5 to-gray-500/5 dark:to-gray-500/5 backdrop-blur-sm">
      <div className="relative">
        <span className="mx-4 inline-flex items-center -space-x-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Avatar
              className={`size-14 border-2 transition-all duration-300 ${
                index === activeIndex
                  ? "border-green-500 shadow-lg shadow-green-500/30 scale-110"
                  : "border-gray-900/30 dark:border-white/30"
              }`}
              key={index}
            >
              <AvatarImage
                src={`/imgs/users/${index + 6}.png`}
                alt="user"
                className="object-cover"
              />
              {index === activeIndex && (
                <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
              )}
            </Avatar>
          ))}
        </span>
        <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span>LIVE</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 md:items-start">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className="size-5 fill-yellow-400 text-yellow-400 transition-transform duration-200 hover:scale-125"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: "twinkle 2s ease-in-out infinite",
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30">
            <Zap className="size-3 text-green-500 animate-pulse" />
            <span className="text-xs font-bold text-green-500">5.0</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-left font-semibold text-gray-900 dark:text-white">
            from <span className="text-2xl font-black">{count}+</span> happy
            users
          </p>
          <div className="flex flex-col">
            <div className="w-12 h-1 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full animate-pulse" />
            <div
              className="w-8 h-1 bg-gradient-to-r from-cyan-500 to-green-400 rounded-full animate-pulse mt-1"
              style={{ animationDelay: "0.5s" }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-white">
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
            <span>Active now</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse"
              style={{ animationDelay: "1s" }}
            />
            <span>Verified</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}
