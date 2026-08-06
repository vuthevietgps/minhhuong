import type { Metadata } from "next";
import { Nunito, Geist_Mono } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "vietnamese"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anh ngữ Minh Hương",
  description:
    "Bảng điều khiển học tiếng Anh dành cho học viên và quản trị viên",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${nunito.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="kid-theme min-h-full flex flex-col">{children}</body>
    </html>
  );
}
