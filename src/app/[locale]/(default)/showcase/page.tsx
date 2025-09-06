import Showcase from "@/components/blocks/showcase";
import { getShowcasePage } from "@/services/page";

import { setRequestLocale } from "next-intl/server";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  // 直接从 pages/showcase 读取数据
  const page = await getShowcasePage(locale);
  const metadata = (page as any).metadata;

  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/showcase`;
  if (locale !== "en") {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/showcase`;
  }

  return {
    title: metadata?.title || "Showcase - Nano Banana",
    description: metadata?.description || "",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function ShowcasePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await getShowcasePage(locale);

  return <>{page.showcase && <Showcase section={page.showcase as any} />}</>;
}
