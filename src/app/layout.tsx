import type { Metadata } from "next";
import Script from "next/script";
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
    icon: "https://cdn.content360.io/ea2381f4-12e0-4efd-b95b-6012c981eae0/uploads/05-2026/SndVQLK75HyjFd6o7gHWoy3GksWvISLfzVqmOBry.png",
    apple: "https://cdn.content360.io/ea2381f4-12e0-4efd-b95b-6012c981eae0/uploads/05-2026/SndVQLK75HyjFd6o7gHWoy3GksWvISLfzVqmOBry.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
        <Script
          src="https://widgets.leadconnectorhq.com/loader.js"
          data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
          data-widget-id="6a44d91d686a90131ba0d5cb"
          data-source="WEB_USER"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
