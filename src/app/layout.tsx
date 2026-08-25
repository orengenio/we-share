import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import CookieConsent from "@/components/cookie-consent";
import "./globals.css";

export const dynamic = "force-dynamic";

// Brand typeface — Public Sans across the board, self-hosted/optimized via
// next/font and exposed as --font-public-sans (consumed by --og-font in
// globals.css). Replaces the render-blocking Google Fonts @import.
const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-public-sans",
});

export const metadata: Metadata = {
  title: {
    default: "WeShare — OrenGen Referral & Sales Partner Portal",
    template: "%s | WeShare by OrenGen",
  },
  description: "Track clicks, leads, and earnings. Manage your OrenGen referral partner or sales partner account.",
  themeColor: "#00254B",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={publicSans.variable}>
      <body className="min-h-screen">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
