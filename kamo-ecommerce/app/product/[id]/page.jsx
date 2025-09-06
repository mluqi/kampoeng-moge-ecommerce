import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/service/apiProduct";
import ProductDetailClient from "@/components/ProductDetailClient";
import { notFound } from "next/navigation";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const dynamic = "force-dynamic"; 

// Helper function to clean HTML for metadata
function stripHtmlAndTruncate(html, length) {
  if (!html) return "";
  const plainText = html.replace(/<[^>]*>?/gm, "");
  return plainText.length <= length
    ? plainText
    : plainText.substring(0, length) + "...";
}

// Function to fetch product data, can be reused
async function getProduct(id) {
  try {
    const res = await api.get(`/products/${id}`);
    return res.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    // For other errors, we might want to log them but still treat as not found
    console.error(`Failed to fetch product ${id}:`, error.message);
    return null;
  }
}

// generateMetadata runs on the server
export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Produk Tidak Ditemukan",
      description: "Produk yang Anda cari tidak dapat ditemukan.",
    };
  }

  const title = `${product.product_name} | KAMO Store`;
  const description = stripHtmlAndTruncate(product.product_description, 160);
  const imageUrl = product.product_pictures?.[0]
    ? baseUrl + product.product_pictures[0]
    : `${siteUrl}/og-image.png`; // Fallback OG image

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/product/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/product/${id}`,
      siteName: "KAMO Store",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.product_name,
        },
      ],
      locale: "id_ID",
      type: "website",
    },
  };
}

// The page itself is now an async Server Component
const ProductPage = async ({ params }) => {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound(); // Triggers the not-found.js page
  }

  return (
    <>
      <Navbar />
      {/* Pass initial data to the client component */}
      <ProductDetailClient initialProductData={product} />
      <Footer />
    </>
  );
};

export default ProductPage;
