import type { Metadata, Viewport } from "next";
import { Nunito, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PwaInstallPrompt } from "./pwa-install-prompt";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "vietnamese"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "Anh ngữ Minh Hương",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Minh Hương",
  },
  formatDetection: {
    telephone: false,
  },
  title: "Anh ngữ Minh Hương",
  description:
    "Ứng dụng hỗ trợ học tập, đặc biệt là ngoại ngữ và tiếng Anh cho trẻ em",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6558f5",
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
      <body className="kid-theme min-h-full flex flex-col">
        {children}
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
