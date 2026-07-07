import type { Metadata } from "next";
import CookieConsent from "@/components/cookie-consent";
import "./globals.css";

export const dynamic = "force-dynamic";

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
    <html lang="en">
      <body className="min-h-screen">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
