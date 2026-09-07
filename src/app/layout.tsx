import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SplashScreen } from "@/components/ui/SplashScreen";
import { RegisterSW } from "@/components/ui/RegisterSW";

export const metadata: Metadata = {
  title: "Govt Saathi — Online Verification of Weighing & Measuring Instruments",
  description:
    "Govt Saathi is the online verification and certification system for weighing and measuring instruments under the Legal Metrology Act. Traders, officers, GATCs and citizens on one traceable rail.",
  applicationName: "Govt Saathi",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Govt Saathi",
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
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap"
        />
      </head>
      <body>
        <SplashScreen />
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
