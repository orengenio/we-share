import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "WeShare — OrenGen Affiliate & Partner Portal",
    template: "%s | WeShare by OrenGen",
  },
  description: "Track clicks, leads, and earnings. Manage your OrenGen affiliate or sales partner account.",
  themeColor: "#00254B",
  icons: {
    icon: "https://cdn.content360.io/ea2381f4-12e0-4efd-b95b-6012c981eae0/uploads/05-2026/SndVQLK75HyjFd6o7gHWoy3GksWvISLfzVqmOBry.png",
    apple: "https://cdn.content360.io/ea2381f4-12e0-4efd-b95b-6012c981eae0/uploads/05-2026/SndVQLK75HyjFd6o7gHWoy3GksWvISLfzVqmOBry.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
