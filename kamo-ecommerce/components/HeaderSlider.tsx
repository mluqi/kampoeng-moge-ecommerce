"use client";
import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Link from "next/link";
import api from "@/service/api";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

interface Slide {
  id: number;
  title: string;
  offer_text: string;
  image_url: string;
  button1_text: string;
  button1_link: string;
  button2_text: string;
  button2_link: string;
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
          <div
            key={slide.id}
            className="flex flex-col-reverse md:flex-row items-center justify-between bg-[#E6E9F2] py-8 md:px-14 px-5 mt-6 rounded-xl min-w-full"
          >
            <div className="md:pl-8 mt-10 md:mt-0">
              <p className="md:text-base text-accent pb-1">{slide.offer_text}</p>
              <h1 className="max-w-lg md:text-[40px] md:leading-[48px] text-2xl font-bold">
                {slide.title}
              </h1>
              <div className="flex items-center mt-4 md:mt-6 ">
                <Link href={slide.button1_link || "#"} passHref>
                  <button className="md:px-10 px-7 md:py-2.5 py-2 bg-accent rounded-full text-white font-medium hover:bg-accent/90 transition">
                    {slide.button1_text || "Beli Sekarang"}
                  </button>
                </Link>
                <Link href={slide.button2_link || "#"} passHref>
                  <button className="group flex items-center gap-2 px-6 py-2.5 font-medium hover:text-accent transition">
                    {slide.button2_text || "Lihat Detail"}
                    <Image
                      className="group-hover:translate-x-1 transition"
                      src={assets.arrow_icon}
                      alt="arrow_icon"
                    />
                  </button>
                </Link>
              </div>
            </div>
            <div className="flex items-center flex-1 justify-center">
              <Image
                className="md:w-72 w-48"
                src={baseUrl + slide.image_url}
                alt={`Slide ${index + 1}`}
                width={288}
                height={288}
                priority={index === 0}
              />
            </div>
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
