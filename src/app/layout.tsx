import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "WVFWARP — Генератор конфигураций WARP",
  description: "Генератор конфигураций Cloudflare WARP для AmneziaWG, Clash, WireSock и других клиентов.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
