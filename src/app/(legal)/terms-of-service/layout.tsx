import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Nano Banana ORG",
  description:
    "Terms of Service for Nano Banana AI image editing platform. Understand your rights and responsibilities when using our AI-powered image generation services.",
  robots: "index, follow",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_WEB_URL}/terms-of-service`,
  },
  openGraph: {
    title: "Terms of Service - Nano Banana ORG",
    description:
      "Terms of Service for Nano Banana AI image editing platform. Understand your rights and responsibilities when using our AI-powered image generation services.",
    type: "website",
    url: `${process.env.NEXT_PUBLIC_WEB_URL}/terms-of-service`,
  },
  twitter: {
    card: "summary",
    title: "Terms of Service - Nano Banana ORG",
    description:
      "Terms of Service for Nano Banana AI image editing platform. Understand your rights and responsibilities when using our AI-powered image generation services.",
  },
};

export default function TermsOfServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}