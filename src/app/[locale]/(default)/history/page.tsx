import { getUserUuid } from "@/services/user";
import { findTasksByUser } from "@/models/nano-banana";
import { getHistoryPage } from "@/services/page";
import HistoryClient from "./components/history-client";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  const page = await getHistoryPage(locale);
  const metadata = page.metadata;

  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/history`;
  if (locale !== "en") {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/history`;
  }

  return {
    title: metadata?.title || "Generation History - Nano Banana",
    description: metadata?.description || "",
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // 验证用户登录
  const userUuid = await getUserUuid();
  if (!userUuid) {
    redirect(`/${locale}/auth/signin`);
  }

  // 获取页面数据（包含翻译）
  const pageData = await getHistoryPage(locale);

  // 获取初始数据
  const initialTasks = await findTasksByUser(userUuid, 20);

  return <HistoryClient initialTasks={initialTasks} locale={locale} pageData={pageData} />;
}
