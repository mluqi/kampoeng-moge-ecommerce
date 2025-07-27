"use client";

import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Link from "next/link";
import api from "@/service/api";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const Banner = () => {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await api.get("/banners");
        setBanner(res.data);
      } catch (error) {
        console.error("Gagal memuat data banner:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanner();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-200 animate-pulse my-16 rounded-xl h-[200px] md:h-[250px]"></div>
    );
  }

  if (!banner) {
    return null; // Jangan tampilkan apa-apa jika tidak ada banner
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-between md:pl-20 py-14 md:py-0 bg-[#E6E9F2] my-16 rounded-xl overflow-hidden">
      <Image
        className="max-w-56"
        src={banner.image_left_url ? baseUrl + banner.image_left_url : assets.header_part_3}
        alt={banner.title || "Promo Banner"}
        width={224}
        height={224}
      />
      <div className="flex flex-col items-center justify-center text-center space-y-2 px-4 md:px-0">
        <h2 className="text-2xl md:text-3xl font-semibold max-w-[290px]">
          {banner.title}
        </h2>
        <p className="max-w-[343px] font-medium text-gray-800/60">
          {banner.description}
        </p>

        <Link href={banner.button_link || "#"} passHref>
          <button className="group flex items-center justify-center gap-1 px-12 py-2.5 bg-accent rounded text-white hover:bg-accent/90 transition">
            {banner.button_text || "Buy now"}
            <Image
              className="group-hover:translate-x-1 transition"
              src={assets.arrow_icon_white}
              alt="arrow_icon_white"
            />
          </button>
        </Link>
      </div>
      <Image
        className="hidden md:block max-w-80"
        src={banner.image_right_url ? baseUrl + banner.image_right_url : assets.header_part_1}
        alt={banner.title || "Promo Banner"}
        width={320}
        height={320}
      />
      <Image
        className="md:hidden"
        src={banner.image_mobile_url ? baseUrl + banner.image_mobile_url : assets.header_part_2}
        alt={banner.title || "Promo Banner"}
        width={300}
        height={300}
      />
    </div>
  );
};

export default Banner;
