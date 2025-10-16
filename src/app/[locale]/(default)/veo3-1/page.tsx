import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getVeo3_1Page } from "@/services/page";
import HeroSection from "@/components/template/hero-section";
import FeaturesSection from "@/components/template/features-section";
import HowToUseSection from "@/components/template/how-to-use-section";
import FaqSection from "@/components/template/faq-section";
import { Veo3Workspace } from "@/components/workspace/veo3";
import Veo3ExamplesSection from "@/components/workspace/veo3/components/veo3-examples-section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  // 从 pages/veo3 读取数据
  const page = await getVeo3_1Page(locale);
  const metadata = (page as any).meta;

  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/veo3-1`;
  if (locale !== "en") {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/veo3-1`;
  }

  return {
    title:
      metadata?.title ||
      "Veo 3.1 AI Video Generator - Text to Video & Image to Video with Veo 3.1",
    description:
      metadata?.description ||
      "Create stunning videos with Veo 3.1, Google's advanced AI video generator. Transform text to video and image to video with Veo 3.1's 720P/1080P quality.",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function Veo3Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const page = await getVeo3_1Page(locale);

  // 从URL查询参数中获取初始图片URL
  const initialImageUrl =
    typeof resolvedSearchParams.imageUrl === "string"
      ? resolvedSearchParams.imageUrl
      : null;

  return (
    <>
      {/* Hero Section */}
      <HeroSection pageData={page} />

      {/* Workspace Section */}
      <Veo3Workspace
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12"
        pageData={page}
        initialImageUrl={initialImageUrl}
      />

      {/* Examples Section */}
      <Veo3ExamplesSection pageData={page} />

      {/* Features Section */}
      <FeaturesSection pageData={page} />

      {/* How To Use Section */}
      <HowToUseSection pageData={page} />

      {/* FAQ Section */}
      <FaqSection pageData={page} />
    </>
  );
}
