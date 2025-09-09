import UpscalerWorkspace from "@/components/workspace/upscaler";
import HeroSection from "@/components/workspace/upscaler/hero-section";

interface UpscalerPageClientProps {
  pageData: any;
}

export default function UpscalerPageClient({
  pageData,
}: UpscalerPageClientProps) {
  return (
    <>
      {/* Hero Section */}
      <HeroSection pageData={pageData} />

      {/* Workspace Section */}
      <div className="min-h-screen relative">
        <UpscalerWorkspace
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12"
          pageData={pageData}
        />
      </div>
    </>
  );
}
