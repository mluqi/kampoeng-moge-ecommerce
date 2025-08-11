/** @type {import('next-sitemap').IConfig} */
module.exports = {
  // Ganti dengan URL production website Anda.
  // Pastikan menggunakan https://
  siteUrl: process.env.SITE_URL || "https://www.kampoengmoge.com",

  // Opsi untuk membuat file sitemap tambahan jika Anda memiliki banyak halaman.
  generateIndexSitemap: false, // Set `false` agar hanya membuat satu file sitemap.xml

  // Opsi untuk membuat file robots.txt secara otomatis.
  generateRobotsTxt: true,

  // (Opsional) Halaman yang ingin Anda kecualikan dari sitemap.
  // Gunakan pola glob untuk mencocokkan.
  // Halaman seperti profil, keranjang, login, dll. tidak perlu ada di sitemap.
  exclude: [
    "/profile",
    "/add-address",
    "/cart",
    "/login",
    "/register",
    "/api/*",
  ],

  // (Opsional) Konfigurasi untuk file robots.txt yang akan dibuat.
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/profile", "/add-address", "/cart"] },
    ],
  },
};
