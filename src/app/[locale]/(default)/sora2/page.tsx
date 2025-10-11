import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Sora2Workspace } from "@/components/workspace/sora2";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/sora2`;
  if (locale !== "en") {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/sora2`;
  }

  return {
    title: "Sora 2 AI Video Generator - Text to Video & Image to Video",
    description:
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

  const resolvedSearchParams = await searchParams;

  // 从URL查询参数中获取初始图片URL
  const initialImageUrl =
    typeof resolvedSearchParams.imageUrl === "string"
      ? resolvedSearchParams.imageUrl
      : null;

  return (
    <div className="min-h-screen py-12">
      {/* Page Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-4">
          Sora 2 AI Video Generator
        </h1>
        <p className="text-center text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Create amazing videos from text or images using Sora 2, OpenAI's latest AI video generation model
        </p>
      </div>

      {/* Workspace Section */}
      <Sora2Workspace
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        initialImageUrl={initialImageUrl}
      />
    </div>
  );
}
