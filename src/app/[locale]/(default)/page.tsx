import Branding from "@/components/blocks/branding";
import CTA from "@/components/blocks/cta";
import FAQ from "@/components/blocks/faq";
import Feature from "@/components/blocks/feature";
import Feature1 from "@/components/blocks/feature1";
import Feature2 from "@/components/blocks/feature2";
import Feature3 from "@/components/blocks/feature3";
import Hero from "@/components/blocks/hero";
import Pricing from "@/components/blocks/pricing";
import Showcase from "@/components/blocks/showcase";
import Stats from "@/components/blocks/stats";
import Testimonial from "@/components/blocks/testimonial";
import {
  getLandingPage,
  getPricingPage,
  getShowcasePage,
} from "@/services/page";
import WorkspaceWrapper from "@/components/workspace/wrapper";
import NanoBananaWrapper from "@/components/nano-banana/wrapper";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}`;

  if (locale !== "en") {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}`;
  }

  return {
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await getLandingPage(locale);
  const pricingPage = await getPricingPage(locale);
  const showcasePage = await getShowcasePage(locale);

  return (
    <>
      {page.hero && <Hero hero={page.hero} />}
      <NanoBananaWrapper />
      {/* <WorkspaceWrapper /> */}

      {showcasePage.showcase && (
        <Showcase section={showcasePage.showcase as any} />
      )}
      {/* {page.branding && <Branding section={page.branding} />} */}
      {page.introduce && <Feature1 section={page.introduce} />}
      {page.benefit && <Feature2 section={page.benefit} />}
      {page.usage && <Feature3 section={page.usage} />}
      {page.feature && <Feature section={page.feature} />}

      {/* {page.stats && <Stats section={page.stats} />} */}
      {pricingPage.pricing && <Pricing pricing={pricingPage.pricing} />}
      {/* {page.testimonial && <Testimonial section={page.testimonial} />} */}
      {page.faq && <FAQ section={page.faq} />}
      {page.cta && <CTA section={page.cta} />}
    </>
  );
}
