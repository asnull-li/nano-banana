"use client";

import dynamic from "next/dynamic";

const NanoBananaWorkspace = dynamic(() => import("./index"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading workspace...</p>
      </div>
    </div>
  ),
});

export default function WorkspaceWrapper() {
  return (
    <div className="container py-16 px-4 md:px-8">
      <NanoBananaWorkspace
        credits={100}
        tier="pro"
        onGenerate={async (prompt, options) => {
          console.log("Generating with:", { prompt, options });
          // Implement your API call here
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }}
      />
    </div>
  );
}