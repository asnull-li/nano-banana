import { Metadata } from "next";
import UpscalerWorkspace from "@/components/workspace/upscaler";
// import UpscalerBg from "@/components/backgrounds/upscaler-bg";

export const metadata: Metadata = {
  title: "Nano Banana Workspace - AI Image Generation & Editing",
  description:
    "Transform your images with AI-powered editing and generate stunning visuals from text",
};

export default function WorkspacePage() {
  return (
    <>
      {/* <UpscalerBg /> */}
      <div className="min-h-screen relative">
        <UpscalerWorkspace className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12" />
      </div>
    </>
  );
}
