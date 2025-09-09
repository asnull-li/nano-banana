"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

export default function UpscalerBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDark = mounted && (resolvedTheme === 'dark');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
    }> = [];

    const particleCount = 60;
    const connectionDistance = 120;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.3,
        color: isDark 
          ? (Math.random() > 0.5 ? "#10b981" : "#06b6d4")
          : (Math.random() > 0.5 ? "#059669" : "#0891b2"),
      });
    }

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 120) {
          particle.vx += dx * 0.00002;
          particle.vy += dy * 0.00002;
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - particle.x;
          const dy = particles[j].y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = particle.color;
            ctx.globalAlpha = (1 - distance / connectionDistance) * 0.3;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [isDark]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 -z-10 ${isDark ? 'opacity-25' : 'opacity-35'}`}
      />
      
      <div className={`fixed inset-0 -z-20 bg-gradient-to-br transition-colors duration-700 ${
        isDark 
          ? 'from-gray-950 via-black to-gray-900' 
          : 'from-gray-50 via-white to-green-50/50'
      }`} />
      
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-spin-slower">
          <div className={`absolute top-1/3 left-1/3 w-80 h-80 rounded-full blur-3xl transition-all duration-700 ${
            isDark ? 'bg-green-500/8' : 'bg-green-500/12'
          }`} />
          <div className={`absolute top-1/4 right-1/3 w-96 h-96 rounded-full blur-3xl transition-all duration-700 ${
            isDark ? 'bg-cyan-500/8' : 'bg-cyan-500/12'
          }`} />
          <div className={`absolute bottom-1/3 left-1/4 w-72 h-72 rounded-full blur-3xl transition-all duration-700 ${
            isDark ? 'bg-purple-500/6' : 'bg-purple-500/10'
          }`} />
          <div className={`absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-2xl transition-all duration-700 ${
            isDark ? 'bg-emerald-400/7' : 'bg-emerald-400/11'
          }`} />
        </div>
      </div>

      <div className="fixed inset-0 -z-10">
        <svg className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
          isDark ? 'opacity-4' : 'opacity-8'
        }`}>
          <defs>
            <pattern
              id="upscaler-grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.3"
                className={isDark ? 'text-green-500/20' : 'text-green-500/30'}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#upscaler-grid)" />
        </svg>
      </div>

      
      <style jsx>{`
        @keyframes spin-slower {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin-slower {
          animation: spin-slower 80s linear infinite;
        }
      `}</style>
    </>
  );
}