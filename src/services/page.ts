import { LandingPage, PricingPage, ShowcasePage } from "@/types/pages/landing";
import { HistoryPage } from "@/types/pages/history";

export async function getLandingPage(locale: string): Promise<LandingPage> {
  return (await getPage("landing", locale)) as LandingPage;
}

export async function getPricingPage(locale: string): Promise<PricingPage> {
  return (await getPage("pricing", locale)) as PricingPage;
}

export async function getShowcasePage(locale: string): Promise<ShowcasePage> {
  return (await getPage("showcase", locale)) as ShowcasePage;
}

export async function getHistoryPage(locale: string): Promise<HistoryPage> {
  return (await getPage("history", locale)) as HistoryPage;
}

export async function getAiImageUpscalerPage(locale: string): Promise<any> {
  return (await getPage("ai-image-upscaler", locale)) as any;
}

export async function getVeo3Page(locale: string): Promise<any> {
  return (await getPage("veo3", locale)) as any;
}

export async function getSora2Page(locale: string): Promise<any> {
  return (await getPage("sora2", locale)) as any;
}

export async function getVeo3_1Page(locale: string): Promise<any> {
  return (await getPage("veo3-1", locale)) as any;
}

export async function getWan25Page(locale: string): Promise<any> {
  return (await getPage("wan2-5", locale)) as any;
}

export async function getPage(
  name: string,
  locale: string
): Promise<LandingPage | PricingPage | ShowcasePage | HistoryPage | any> {
  try {
    if (locale === "zh-CN") {
      locale = "zh";
    }

    return await import(
      `@/i18n/pages/${name}/${locale.toLowerCase()}.json`
    ).then((module) => module.default);
  } catch (error) {
    console.warn(`Failed to load ${locale}.json, falling back to en.json`);

    return await import(`@/i18n/pages/${name}/en.json`).then(
      (module) => module.default
    );
  }
}
