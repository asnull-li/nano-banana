import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Nano Banana ORG",
  description:
    "Privacy Policy for Nano Banana AI image editing platform. Learn how we protect your data and creative content.",
  robots: "index, follow",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_WEB_URL}/privacy-policy`,
  },
  openGraph: {
    title: "Privacy Policy - Nano Banana ORG",
    description:
      "Privacy Policy for Nano Banana AI image editing platform. Learn how we protect your data and creative content.",
    type: "website",
    url: `${process.env.NEXT_PUBLIC_WEB_URL}/privacy-policy`,
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy - Nano Banana ORG",
    description:
      "Privacy Policy for Nano Banana AI image editing platform. Learn how we protect your data and creative content.",
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
