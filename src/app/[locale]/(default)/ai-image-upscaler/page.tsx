import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getAiImageUpscalerPage } from "@/services/page";
import UpscalerPageClient from "./page-client";

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
    title: metadata?.title || "Nano Banana Image Upscaler - AI Photo Enhancement Tool",
    description: metadata?.description || "Nano Banana Image Upscaler uses advanced AI technology to enhance and upscale your photos with professional quality.",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await getAiImageUpscalerPage(locale);

  return <UpscalerPageClient pageData={page} />;
}
