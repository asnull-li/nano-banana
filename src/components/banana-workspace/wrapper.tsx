"use client";

import dynamic from "next/dynamic";
import "./animations.css";

const BananaWorkspace = dynamic(() => import("./index"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 flex items-center justify-center">
      <div className="text-center space-y-4">
        {/* Loading spinner */}
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        
        {/* Loading text */}
        <p className="text-sm text-muted-foreground">
          Loading Nano Banana Studio...
        </p>
        
        {/* Progress bar */}
        <div className="w-48 mx-auto">
          <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-loading-bar" />
          </div>
        </div>
      </div>
    </div>
  ),
});

export default function BananaWorkspaceWrapper() {
  return (
    <div id="banana-workspace" className="py-16">
      <BananaWorkspace />
    </div>
  );
}