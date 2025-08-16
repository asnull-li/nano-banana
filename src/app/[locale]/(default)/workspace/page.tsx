import WorkspaceWrapper from "@/components/workspace/wrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nano Banana Workspace - AI Image Generation & Editing",
  description: "Transform your images with AI-powered editing and generate stunning visuals from text",
};

export default function WorkspacePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-green-500/5">
      <WorkspaceWrapper />
    </div>
  );
}
