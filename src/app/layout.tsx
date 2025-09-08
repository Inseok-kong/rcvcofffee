import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Navigation } from "@/components/layout/Navigation";
import { FloatingHomeButton } from "@/components/ui/FloatingHomeButton";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "커피 관리 PWA",
  description: "커피 사용량 및 레시피 관리 PWA 앱",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "커피 관리",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#8B4513",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8B4513" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="커피 관리" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-gray-50`}>
               <AuthProvider>
                 <div className="min-h-screen flex flex-col">
                   <main className="flex-1 pb-16">
                     {children}
                   </main>
                   <Navigation />
                   <FloatingHomeButton />
                 </div>
               </AuthProvider>
      </body>
    </html>
  );
}
