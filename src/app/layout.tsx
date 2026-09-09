import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "數位名片 ‧ 線上預約",
  description: "客戶自己挑時間，預約直接進你的 Google 日曆。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
