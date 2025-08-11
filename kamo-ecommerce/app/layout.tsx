import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import { Toaster } from "react-hot-toast";
import ChatWidget from "@/components/ChatWidget";
import MobileBottomNav from "@/components/MobileBottomNav";

const poppinsFont = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "KAMO Ecommerce - Jual Sparepart Moge Terpercaya", // Judul default
    template: "%s | KAMO Ecommerce", // Template untuk judul di halaman lain
  },
  description:
    "Temukan berbagai sparepart motor gede (moge) berkualitas, suku cadang, dan aksesoris di KAMO Ecommerce. Belanja aman, pengiriman cepat.",
  keywords: [
    "moge",
    "motor gede",
    "harley davidson",
    "kamo ecommerce",
    "suku cadang motor",
  ],
  openGraph: {
    title: "KAMO Ecommerce - Jual Sparepart Moge Terpercaya",
    description:
      "Temukan berbagai sparepart motor gede (moge) berkualitas dan aksesorisnya.",
    url: "https://www.kamoecommerce.com", // Ganti dengan URL produksi Anda
    siteName: "KAMO Ecommerce",
    images: [
      {
        url: "assets/logo_accent.png", // URL gambar default untuk social media
        width: 1200,
        height: 630,
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KAMO Ecommerce - Jual Sparepart Moge Terpercaya",
    description:
      "Temukan berbagai motor gede (moge) berkualitas dan aksesorisnya.",
    images: "assets/logo_accent.png", // URL gambar untuk Twitter
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${poppinsFont.variable} antialiased`}>
        <ClientProviders>
          <Toaster position="top-center" reverseOrder={false} />
          {children}
          <ChatWidget />
          <MobileBottomNav />
        </ClientProviders>
      </body>
    </html>
  );
}
