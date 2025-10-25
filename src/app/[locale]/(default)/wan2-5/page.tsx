import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getWan25Page } from "@/services/page";
import HeroSection from "@/components/template/hero-section";
import FeaturesSection from "@/components/template/features-section";
import HowToUseSection from "@/components/template/how-to-use-section";
import FaqSection from "@/components/template/faq-section";
import { Wan25Workspace } from "@/components/workspace/wan25";
import Wan25ExamplesSection from "@/components/workspace/wan25/components/wan25-examples-section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  // 从 pages/wan2-5 读取数据
  const page = await getWan25Page(locale);
  const metadata = (page as any).meta;

  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/wan2-5`;
  if (locale !== "en") {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/wan2-5`;
  }

  return {
    title:
      metadata?.title ||
      "Wan 2.5 AI Video Generator - Text to Video & Image to Video",
    description:
      metadata?.description ||
      "Create stunning videos with Wan 2.5, Alibaba's advanced AI video generator. Transform text to video and image to video with Wan 2.5.",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function Wan25Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const page = await getWan25Page(locale);
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
      <Wan25Workspace
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12"
        pageData={page}
        initialImageUrl={initialImageUrl}
      />

      {/* Examples Section */}
      <Wan25ExamplesSection pageData={page} />

      {/* Features Section */}
      <FeaturesSection pageData={page} />

      {/* How To Use Section */}
      <HowToUseSection pageData={page} />

      {/* FAQ Section */}
      <FaqSection pageData={page} />
    </>
  );
}
