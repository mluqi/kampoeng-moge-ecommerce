import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeaderSlider from "@/components/HeaderSlider";
import HomeProducts from "@/components/HomeProducts";
import FeaturedProduct from "@/components/FeaturedProduct";
import Banner from "@/components/Banner";
// import NewsLetter from "@/components/NewsLetter";


export default function Home() {
  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32">
        <HeaderSlider />
        <HomeProducts/>
        <FeaturedProduct />
        <Banner />
        {/* <NewsLetter /> */}
      </div>
      <Footer />
    </>
  );
}
