"use client";

import dynamic from "next/dynamic";

const NanoBananaWorkspace = dynamic(() => import("./index"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading Nano Banana...</p>
      </div>
    </div>
  ),
});

export default function NanoBananaWrapper() {
  return (
    <div id="nano-banana" className="container py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent">
            Nano Banana AI 创作工作台
          </h2>
          <p className="text-lg text-muted-foreground">
            使用先进的 AI 技术，将您的想象转化为精美的图像
          </p>
        </div>
        
        <NanoBananaWorkspace 
          defaultMode="image-to-image"
          onComplete={(results) => {
            console.log("Generation completed:", results);
          }}
        />
      </div>
    </div>
  );
}