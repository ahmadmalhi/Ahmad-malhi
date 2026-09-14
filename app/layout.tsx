import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

const siteUrl = "https://nexora-ai.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Nexora AI — Your private AI workspace",
    template: "%s · Nexora AI",
  },
  description:
    "Nexora AI is a fast, private AI chat workspace with voice, file export, and multilingual support. Sign up free and start chatting in seconds.",
  keywords: [
    "Nexora AI",
    "AI chat",
    "AI workspace",
    "AI assistant",
    "voice AI",
    "chat with AI",
  ],
  authors: [{ name: "Ahmad Malhi" }],
  creator: "Ahmad Malhi",
  applicationName: "Nexora AI",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Nexora AI — Your private AI workspace",
    description:
      "A fast, private AI chat workspace with voice, file export, and multilingual support.",
    siteName: "Nexora AI",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Nexora AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexora AI — Your private AI workspace",
    description:
      "A fast, private AI chat workspace with voice, file export, and multilingual support.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0e0f1a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
