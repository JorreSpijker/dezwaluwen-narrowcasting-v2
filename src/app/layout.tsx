import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/navigation";
import ClientLayout from "@/components/ClientLayout";
import Slideshow from "@/components/Slideshow";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zwaluwen Narrowcasting",
  description: "Korfbal narrowcasting systeem voor Zwaluwen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        <ClientLayout>
          <Navigation />
          <Slideshow />
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            {children}
          </main>
        </ClientLayout>
      </body>
    </html>
  );
}
