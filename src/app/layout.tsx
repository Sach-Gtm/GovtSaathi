import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GovtSathi — Online Verification of Weighing & Measuring Instruments",
  description:
    "GovtSathi is the online verification and certification system for weighing and measuring instruments under the Legal Metrology Act. Traders, officers, GATCs and citizens on one traceable rail.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
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
      <body>{children}</body>
    </html>
  );
}
