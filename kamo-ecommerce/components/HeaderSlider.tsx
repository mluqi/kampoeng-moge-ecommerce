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
      <div className="bg-gray-200 animate-pulse py-8 md:px-14 px-5 mt-6 rounded-xl min-w-full h-[350px] md:h-[300px]"></div>
    );
  }

  if (slides.length === 0) {
    return null; // Jangan tampilkan apa-apa jika tidak ada slide
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
              className="block relative py-8 md:px-14 px-5 mt-6 rounded-xl min-w-full h-[350px] md:h-[328px] overflow-hidden"
            >
              {/* Gambar untuk Desktop */}
              <Image
                className="hidden md:block object-cover"
                src={baseUrl + slide.image_url_desktop}
                alt={`Slide Desktop ${index + 1}`}
                layout="fill"
                priority={index === 0}
              />
              {/* Gambar untuk Mobile */}
              <Image
                className="block md:hidden object-cover"
                src={baseUrl + slide.image_url_mobile}
                alt={`Slide Mobile ${index + 1}`}
                fill
                priority={index === 0}
              />
            </Link>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-8">
        {slides.map((_, index) => (
          <div
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`h-2 w-2 rounded-full cursor-pointer ${
              currentSlide === index ? "bg-accent" : "bg-gray-500/30"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default HeaderSlider;
