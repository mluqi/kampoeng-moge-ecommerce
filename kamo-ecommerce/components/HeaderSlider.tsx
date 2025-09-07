"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import api from "@/service/api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

interface Slide {
  id: number;
  link: string;
  image_url_desktop: string;
  image_url_mobile: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const HeaderSlider = ({ initialSlides = [] }: { initialSlides?: Slide[] }) => {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  // Loading hanya true jika tidak ada data awal dari server
  const [loading, setLoading] = useState(initialSlides.length === 0);

  useEffect(() => {
    // Fetch data di client hanya sebagai fallback jika initialSlides kosong
    if (initialSlides.length === 0) {
      const fetchSlides = async () => {
        try {
          const res = await api.get("/header-slides");
          setSlides(res.data);
        } catch (error) {
          console.error("Gagal memuat data slider di client:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchSlides();
    }
  }, [initialSlides]);

  if (loading) {
    return (
      <div className="bg-gray-200 animate-pulse mt-6 rounded-xl w-full aspect-[32/9] md:aspect-[32/9]"></div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full pb-10">
      <Swiper
        modules={[Pagination, Autoplay]}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          el: ".swiper-pagination-custom",
        }}
        className="mt-6 rounded-xl overflow-hidden"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <Link
              href={slide.link || "/"}
              className="block relative overflow-hidden group"
            >
              {/* Container untuk Desktop (32:6) */}
              <div className="hidden md:block relative w-full aspect-[640/127]">
                <Image
                  src={baseUrl + slide.image_url_desktop}
                  alt={`Slide Desktop ${index + 1}`}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 1424px"
                />
              </div>

              {/* Container untuk Mobile (3:4) */}
              <div className="block md:hidden relative w-full aspect-[3/4]">
                <Image
                  src={baseUrl + slide.image_url_mobile}
                  alt={`Slide Mobile ${index + 1}`}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="(min-width: 769px) 100vw, 315px"
                />
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="swiper-pagination-custom flex items-center justify-center gap-2 mt-8"></div>
      <style jsx global>{`
        .swiper-pagination-custom .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background-color: rgba(107, 114, 128, 0.3); /* bg-gray-500/30 */
          opacity: 1;
          transition: all 0.3s;
        }
        .swiper-pagination-custom .swiper-pagination-bullet-active {
          background-color: #004526; /* bg-accent */
          transform: scale(1.25);
        }
        .swiper-pagination-custom .swiper-pagination-bullet:hover {
          background-color: rgba(107, 114, 128, 0.5); /* hover:bg-gray-500/50 */
        }
      `}</style>
    </div>
  );
};

export default HeaderSlider;
