import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SplashScreen } from "@/components/ui/SplashScreen";
import { RegisterSW } from "@/components/ui/RegisterSW";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display", display: "swap" });

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
    { media: "(prefers-color-scheme: light)", color: "#F7F5EF" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1220" }
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <SplashScreen />
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
