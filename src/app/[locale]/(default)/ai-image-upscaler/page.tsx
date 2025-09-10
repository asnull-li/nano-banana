import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getAiImageUpscalerPage } from "@/services/page";
import HeroSection from "@/components/workspace/upscaler/hero-section";
import FeaturesSection from "@/components/workspace/upscaler/features-section";
import HowToUseSection from "@/components/workspace/upscaler/how-to-use-section";
import FaqSection from "@/components/workspace/upscaler/faq-section";
import UpscalerWorkspace from "@/components/workspace/upscaler";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  // 从 pages/ai-image-upscaler 读取数据
  const page = await getAiImageUpscalerPage(locale);
  const metadata = (page as any).meta;

  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/ai-image-upscaler`;
  if (locale !== "en") {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/ai-image-upscaler`;
  }

  return {
    title:
      metadata?.title ||
      "Nano Banana Image Upscaler - AI Photo Enhancement Tool",
    description:
      metadata?.description ||
      "Nano Banana Image Upscaler uses advanced AI technology to enhance and upscale your photos with professional quality.",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function WorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const page = await getAiImageUpscalerPage(locale);
  
  // 从URL查询参数中获取初始图片URL
  const initialImageUrl = typeof resolvedSearchParams.imageUrl === 'string' ? resolvedSearchParams.imageUrl : null;

  return (
    <>
      {/* Hero Section */}
      <HeroSection pageData={page} />

      {/* Workspace Section */}
      <UpscalerWorkspace
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12"
        pageData={page}
        initialImageUrl={initialImageUrl}
      />

      {/* Features Section */}
      <FeaturesSection pageData={page} />

      {/* How To Use Section */}
      <HowToUseSection pageData={page} />

      {/* FAQ Section */}
      <FaqSection pageData={page} />
    </>
  );
}
