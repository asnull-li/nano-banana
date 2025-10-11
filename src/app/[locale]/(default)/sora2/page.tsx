import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getSora2Page } from "@/services/page";
import HeroSection from "@/components/template/hero-section";
import FeaturesSection from "@/components/template/features-section";
import HowToUseSection from "@/components/template/how-to-use-section";
import FaqSection from "@/components/template/faq-section";
import { Sora2Workspace } from "@/components/workspace/sora2";
import Sora2ExamplesSection from "@/components/workspace/sora2/components/sora2-examples-section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  // 从 pages/sora2 读取数据
  const page = await getSora2Page(locale);
  const metadata = (page as any).meta;

  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/sora2`;
  if (locale !== "en") {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/sora2`;
  }

  return {
    title:
      metadata?.title ||
      "Sora 2 AI Video Generator - Text to Video & Image to Video",
    description:
      metadata?.description ||
      "Create stunning videos with Sora 2, OpenAI's advanced AI video generator. Transform text to video and image to video with Sora 2.",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function Sora2Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const page = await getSora2Page(locale);
  const resolvedSearchParams = await searchParams;

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
      <Sora2Workspace
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12"
        pageData={page}
        initialImageUrl={initialImageUrl}
      />

      {/* Examples Section */}
      <Sora2ExamplesSection pageData={page} />

      {/* Features Section */}
      <FeaturesSection pageData={page} />

      {/* How To Use Section */}
      <HowToUseSection pageData={page} />

      {/* FAQ Section */}
      <FaqSection pageData={page} />
    </>
  );
}
