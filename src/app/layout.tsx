import type { Metadata, Viewport } from "next";
import { Mukta, Tiro_Devanagari_Hindi } from "next/font/google";
import "./globals.css";
import { SplashScreen } from "@/components/ui/SplashScreen";
import { RegisterSW } from "@/components/ui/RegisterSW";
import { GovMasthead } from "@/components/ui/GovMasthead";

// Government-standard type: Tiro Devanagari Hindi (gazette-style serif, headings)
// + Mukta (Ek Type's Indian sans used across gov.in portals, body/UI).
// Both cover Latin + Devanagari so the interface reads bilingually.
const mukta = Mukta({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap"
});
const tiro = Tiro_Devanagari_Hindi({
  subsets: ["latin", "devanagari"],
  weight: ["400"],
  style: ["normal"],
  variable: "--font-display",
  display: "swap"
});

export const metadata: Metadata = {
  title: "MAAPSETU — Online Verification of Weighing & Measuring Instruments",
  description:
    "MAAPSETU is the online verification and certification system for weighing and measuring instruments under the Legal Metrology Act. Traders, officers, GATCs and citizens on one traceable rail.",
  applicationName: "MAAPSETU",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "MAAPSETU",
    statusBarStyle: "default"
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" }
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }]
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.startsWith("http")
      ? process.env.NEXT_PUBLIC_APP_URL
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  )
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0B2E6F" },
    { media: "(prefers-color-scheme: dark)", color: "#06183C" }
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mukta.variable} ${tiro.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to main content
        </a>
        <SplashScreen />
        <GovMasthead />
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
