"use client";

import NanoBananaWorkspace from "@/components/workspace";

export default function WorkspacePage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-7xl">
        <NanoBananaWorkspace
          credits={100}
          tier="pro"
          onGenerate={async (prompt, options) => {
            // console.log("Generating with:", { prompt, options });
            // Implement your API call here
            // await new Promise((resolve) => setTimeout(resolve, 3000));
          }}
        />
      </div>
    </div>
  );
}
