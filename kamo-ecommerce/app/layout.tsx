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
    default: "KAMO Official E-Commerce Store Trusted Since 2008",
    template: "%s | KAMO Ecommerce",
  },
  description:
    "Dapatkan berbagai sparepart dan aksesoris moge berkualitas di kampoengmoge.com. ",
  keywords: [
    "moge",
    "motor gede",
    "harley davidson",
    "kamo ecommerce",
    "suku cadang motor",
  ],
  openGraph: {
    title: "KAMO Official E-Commerce Store Trusted Since 2008",
    description:
      "Dapatkan berbagai sparepart dan aksesoris moge berkualitas di kampoengmoge.com.",
    url: "https://kampoengmoge.com",
    siteName: "kampoengmoge.com",
    images: [
      {
        url: "https://kampoengmoge.com/uploads/settings/kamo.png", // Pastikan URL gambar absolut dan benar
        width: 1200,
        height: 630,
        alt: "KAMO Ecommerce Logo",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KAMO Official E-Commerce Store Trusted Since 2008",
    description:
      "Dapatkan berbagai sparepart dan aksesoris moge berkualitas di kampoengmoge.com. ",
    images: "https://kampoengmoge.com/uploads/settings/kamo.png",
    site: "@kampoengmoge", // Tambahkan handle Twitter jika ada
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
  alternates: {
    canonical: "https://kampoengmoge.com",
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
