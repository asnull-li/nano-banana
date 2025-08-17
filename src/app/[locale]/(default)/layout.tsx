import Footer from "@/components/blocks/footer";
import Header from "@/components/blocks/header";
import { ReactNode } from "react";
import { getLandingPage } from "@/services/page";
import Feedback from "@/components/feedback";
import HashScroll from "@/components/hash-scroll";

export default async function DefaultLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await getLandingPage(locale);

  return (
    <>
      <HashScroll />
      {page.header && <Header header={page.header} />}
      <div className="h-14"></div>
      <main className="overflow-x-hidden">{children}</main>
      {page.footer && <Footer footer={page.footer} />}
      {/* <Feedback socialLinks={page.footer?.social?.items} /> */}
    </>
  );
}
