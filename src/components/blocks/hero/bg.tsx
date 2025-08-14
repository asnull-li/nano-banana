"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

export default function HeroBg() {
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

    const particleCount = 50;
    const connectionDistance = 150;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
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
        
        if (distance < 100) {
          particle.vx += dx * 0.00001;
          particle.vy += dy * 0.00001;
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
            ctx.globalAlpha = (1 - distance / connectionDistance) * 0.2;
            ctx.lineWidth = 0.5;
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
        className={`fixed inset-0 -z-10 ${isDark ? 'opacity-30' : 'opacity-40'}`}
      />
      
      <div className={`fixed inset-0 -z-20 bg-gradient-to-br transition-colors duration-500 ${
        isDark 
          ? 'from-black via-gray-950 to-black' 
          : 'from-gray-50 via-white to-gray-100'
      }`} />
      
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-spin-slow">
          <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl transition-all duration-500 ${
            isDark ? 'bg-green-500/5' : 'bg-green-500/10'
          }`} />
          <div className={`absolute top-1/3 right-1/4 w-96 h-96 rounded-full blur-3xl transition-all duration-500 ${
            isDark ? 'bg-cyan-500/5' : 'bg-cyan-500/10'
          }`} />
          <div className={`absolute bottom-1/4 left-1/3 w-96 h-96 rounded-full blur-3xl transition-all duration-500 ${
            isDark ? 'bg-emerald-500/5' : 'bg-emerald-500/10'
          }`} />
        </div>
      </div>

      <div className="fixed inset-0 -z-10">
        <svg className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
          isDark ? 'opacity-5' : 'opacity-10'
        }`}>
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
                className={isDark ? 'text-gray-600' : 'text-gray-400'}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className={`fixed top-0 left-0 w-full h-px bg-gradient-to-r from-transparent to-transparent animate-scan ${
        isDark ? 'via-green-500/30' : 'via-green-500/50'
      }`} />
      
      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes scan {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(100vh);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 60s linear infinite;
        }
        
        .animate-scan {
          animation: scan 4s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}