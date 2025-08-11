// next-sitemap.config.js

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  generateRobotsTxt: true, // Otomatis membuat robots.txt
  robotsTxtOptions: {
    // Konfigurasi untuk robots.txt
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/profile/",
          "/cart/",
          "/checkout/",
          "/add-address/",
        ],
      },
    ],
    // Anda bisa menambahkan sitemap tambahan jika perlu,
    // tapi biasanya cukup satu sitemap utama.
    // additionalSitemaps: [
    //   `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/server-sitemap.xml`,
    // ],
  },
  // Fungsi ini akan mengambil semua produk untuk dijadikan path dinamis
  additionalPaths: async (config) => {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const response = await fetch(`${BACKEND_URL}/api/products?limit=9999`);
    const productsData = await response.json();
    const products = productsData.data || [];

    // Ubah data produk menjadi format yang dibutuhkan next-sitemap
    const productPaths = products.map((product) => ({
      loc: `/product/${product.product_id}`, // Path URL
      lastmod: new Date(product.updatedAt).toISOString(), // Tanggal modifikasi terakhir
      changefreq: "weekly",
      priority: 0.8,
    }));

    return productPaths;
  },
};