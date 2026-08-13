import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.SITE_URL?.replace(/\/$/, "");

export const metadata: Metadata = {
  title: "晶圓城 FAB CITY｜半導體製造模擬",
  description:
    "把矽原料一路送進晶圓廠，完成光刻、蝕刻、離子植入、金屬互連、封裝與測試。",
  ...(siteUrl
    ? {
        metadataBase: new URL(`${siteUrl}/`),
        openGraph: {
          title: "晶圓城 FAB CITY｜你能守住良率嗎？",
          description: "14 站低多邊形晶片製造模擬，從一粒矽到一顆可用晶片。",
          images: [{ url: `${siteUrl}/og.png`, width: 1729, height: 910 }],
          type: "website",
        },
        twitter: {
          card: "summary_large_image" as const,
          title: "晶圓城 FAB CITY｜你能守住良率嗎？",
          description: "14 站低多邊形晶片製造模擬。",
          images: [`${siteUrl}/og.png`],
        },
      }
    : {}),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
