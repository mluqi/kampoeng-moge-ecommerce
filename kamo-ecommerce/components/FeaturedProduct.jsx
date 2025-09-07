"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import api from "@/service/api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { assets } from "@/assets/assets";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const FeaturedProduct = ({ initialProducts = [] }) => {
  const [products, setProducts] = useState(initialProducts);
  // Loading hanya true jika tidak ada data awal dari server
  const [loading, setLoading] = useState(initialProducts.length === 0);

  useEffect(() => {
    // Fetch data di client hanya sebagai fallback jika initialProducts kosong
    if (initialProducts.length === 0) {
      const fetchFeaturedProducts = async () => {
        try {
          const res = await api.get("/featured-products");
          setProducts(res.data);
        } catch (error) {
          console.error("Failed to fetch featured products:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchFeaturedProducts();
    }
  }, [initialProducts]);

  // Tampilkan skeleton loading yang menarik
  if (loading) {
    return (
      <div className="mt-14 mb-14">
        <div className="flex flex-col items-center">
          <div className="h-9 bg-gray-200 rounded-md w-64 mb-2 animate-pulse"></div>
          <div className="w-28 h-1 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-14 mt-12 md:px-14 px-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] bg-gray-200 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  // Jangan tampilkan apa-apa jika tidak ada produk
  if (products.length === 0) {
    return null;
  }

  // Komponen Card internal untuk menghindari duplikasi kode
  const ProductCard = ({ product, isFirst }) => (
    <div className="relative group aspect-[3/4] overflow-hidden rounded-lg">
      <Image
        src={baseUrl + product.image_url}
        alt={product.title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={isFirst}
        onClick={() => (window.location.href = product.button_link || "#")}
        className="group-hover:brightness-75 transition duration-300 object-cover"
      />
      <div className="group-hover:-translate-y-4 transition duration-300 absolute bottom-8 left-8 text-white space-y-2">
        <p className="font-medium text-xl lg:text-2xl">{product.title}</p>
        <p className="text-sm lg:text-base leading-5 max-w-60">
          {product.description}
        </p>
        {/* <Link href={product.button_link || "#"} passHref>
          <button className="flex items-center gap-1.5 bg-accent px-4 py-2 rounded">
            {product.button_text || "Beli Sekarang"}{" "}
            <Image
              className="h-3 w-3"
              src={assets.redirect_icon}
              alt="Redirect Icon"
            />
          </button>
        </Link> */}
        <div>
          <button
            className="flex items-center gap-1.5 bg-accent px-4 py-2 rounded"
            onClick={() => (window.location.href = product.button_link || "#")}
          >
            Klik disini
            <Image
              className="h-3 w-3"
              src={assets.redirect_icon}
              alt="Redirect Icon"
            />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mt-14 mb-14">
      <div className="flex flex-col items-center">
        <p className="text-3xl font-medium">Produk Unggulan</p>
        <div className="w-28 h-0.5 bg-accent mt-2"></div>
      </div>

      {/* Logika: Jika produk > 3, gunakan slider. Jika tidak, gunakan grid. */}
      {products.length > 3 ? (
        // Tampilan Slider
        <div className="relative md:px-14 px-4 mt-12">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            loop={true}
            grabCursor={true}
            centeredSlides={true}
            autoplay={true}
            speed={500}
            navigation={{
              nextEl: ".swiper-button-next-featured",
              prevEl: ".swiper-button-prev-featured",
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 30 },
            }}
            className="!pb-10"
          >
            {products.map((product, index) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} isFirst={index === 0} />
              </SwiperSlide>
            ))}
          </Swiper>
          {/* Tombol Navigasi Kustom */}
          <button
            className="swiper-button-prev-featured absolute top-1/2 -translate-y-1/2 left-0 z-10 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition disabled:opacity-0"
            aria-label="Produk unggulan sebelumnya"
          >
            <FiChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button
            className="swiper-button-next-featured absolute top-1/2 -translate-y-1/2 right-0 z-10 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition disabled:opacity-0"
            aria-label="Produk unggulan berikutnya"
          >
            <FiChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      ) : (
        // Tampilan Grid (untuk 1-3 produk)
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-14 mt-12 md:px-14 px-4">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              isFirst={index === 0}
            />
          ))}
        </div>
      )}

      {/* Custom Styles for Swiper Pagination */}
      <style jsx global>{`
        .swiper-pagination-bullet {
          background: #999ca1ff; /* Warna abu-abu untuk dot tidak aktif */
        }
        .swiper-pagination-bullet-active {
          background: #004526 !important; /* Warna biru untuk dot aktif */
        }
      `}</style>
    </div>
  );
};

export default FeaturedProduct;
