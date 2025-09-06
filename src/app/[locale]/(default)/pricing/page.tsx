import Pricing from "@/components/blocks/pricing";
import FAQ from "@/components/blocks/faq";
import { getPricingPage } from "@/services/page";
import { setRequestLocale } from "next-intl/server";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  // 直接从 pages/pricing 读取数据
  const page = await getPricingPage(locale);
  const metadata = (page as any).metadata;

  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/pricing`;
  if (locale !== "en") {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/pricing`;
  }

  return {
    title: metadata?.title || "Pricing - Nano Banana",
    description: metadata?.description || "",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await getPricingPage(locale);

  return (
    <>
      {page.pricing && <Pricing pricing={page.pricing} />}
      {page.faq && <FAQ section={page.faq} />}
    </>
  );
}
