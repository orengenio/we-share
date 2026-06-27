import type { Metadata } from "next";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "WeShare — OrenGen Affiliate & Partner Portal",
    template: "%s | WeShare",
  },
  description: "Track clicks, leads, earnings and manage your OrenGen affiliate or sales partner account.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
