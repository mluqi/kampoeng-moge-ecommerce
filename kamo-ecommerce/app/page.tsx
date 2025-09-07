import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeaderSlider from "@/components/HeaderSlider";
import HomeProducts from "@/components/HomeProducts";
import FeaturedProduct from "@/components/FeaturedProduct";
import api from "@/service/apiProduct";

// Fungsi untuk mengambil data di server
async function getHeaderSlides() {
  try {
    // Menggunakan endpoint yang mengambil semua slide aktif
    const res = await api.get("/header-slides");
    return res.data;
  } catch (error) {
    console.error("Server failed to fetch header slides:", error);
    return []; // Kembalikan array kosong jika gagal
  }
}

async function getFeaturedProducts() {
  try {
    const res = await api.get("/featured-products");
    return res.data;
  } catch (error) {
    console.error("Server failed to fetch featured products:", error);
    return [];
  }
}

export default async function Home() {
  // Ambil data secara paralel untuk performa lebih baik
  const [slides, featuredProducts] = await Promise.all([
    getHeaderSlides(),
    getFeaturedProducts(),
  ]);

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32">
        <HeaderSlider initialSlides={slides} />
        <HomeProducts />
        <FeaturedProduct initialProducts={featuredProducts} />
      </div>
      <Footer />
    </>
  );
}
