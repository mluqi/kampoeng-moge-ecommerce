"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import api from "@/service/api";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

interface Slide {
  id: number;
  link: string;
  image_url_desktop: string;
  image_url_mobile: string;
}

const HeaderSlider = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await api.get("/header-slides");
        setSlides(res.data);
      } catch (error) {
        console.error("Gagal memuat data slider:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handleSlideChange = (index: React.SetStateAction<number>) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <div className="bg-gray-200 animate-pulse mt-6 rounded-xl w-full aspect-[32/9] md:aspect-[32/9]"></div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden relative w-full">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {slides.map((slide, index) => (
          <div key={slide.id} className="min-w-full mt-6 flex-shrink-0">
            <Link
              href={slide.link || "/"}
              className="block relative mt-6 rounded-xl min-w-full overflow-hidden group"
            >
              {/* Container untuk Desktop (32:6) */}
              <div className="hidden md:block relative w-full aspect-[32/6]">
                <Image
                  src={baseUrl + slide.image_url_desktop}
                  alt={`Slide Desktop ${index + 1}`}
                  fill
                  priority={index === 0}
                  className="object-cover transition-transform duration-300"
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
                  className="object-cover transition-transform duration-300"
                  sizes="(min-width: 769px) 100vw, 315px"
                />
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-8">
        {slides.map((_, index) => (
          <div
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`h-2 w-2 mb-2 rounded-full cursor-pointer transition-all duration-300 ${
              currentSlide === index ? "bg-accent scale-125" : "bg-gray-500/30 hover:bg-gray-500/50"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default HeaderSlider;
