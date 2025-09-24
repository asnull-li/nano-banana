import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy - Nano Banana ORG",
  description:
    "Refund Policy for Nano Banana AI image editing platform. Learn about our refund terms, eligibility conditions, and how to request a refund for your purchase.",
  robots: "index, follow",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_WEB_URL}/refund-policy`,
  },
  openGraph: {
    title: "Refund Policy - Nano Banana ORG",
    description:
      "Refund Policy for Nano Banana AI image editing platform. Learn about our refund terms, eligibility conditions, and how to request a refund for your purchase.",
    type: "website",
    url: `${process.env.NEXT_PUBLIC_WEB_URL}/refund-policy`,
  },
  twitter: {
    card: "summary",
    title: "Refund Policy - Nano Banana ORG",
    description:
      "Refund Policy for Nano Banana AI image editing platform. Learn about our refund terms, eligibility conditions, and how to request a refund for your purchase.",
  },
};

export default function RefundPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}