"use client";

import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import api from "@/service/api";
import Link from "next/link";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const FeaturedProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  if (loading || products.length === 0) {
    // Jangan tampilkan apa-apa jika sedang loading atau tidak ada data
    return null;
  }

  return (
    <div className="mt-14">
      <div className="flex flex-col items-center">
        <p className="text-3xl font-medium">Produk Unggulan</p>
        <div className="w-28 h-0.5 bg-accent mt-2"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-14 mt-12 md:px-14 px-4">
        {products.map(({ id, image_url, title, description, button_text, button_link }) => (
          <div key={id} className="relative group aspect-[3/4] overflow-hidden rounded-lg">
            <Image
              src={baseUrl + image_url}
              alt={title}
              fill
              sizes="50vw"
              className="group-hover:brightness-75 transition duration-300 object-cover"
            />
            <div className="group-hover:-translate-y-4 transition duration-300 absolute bottom-8 left-8 text-white space-y-2">
              <p className="font-medium text-xl lg:text-2xl">{title}</p>
              <p className="text-sm lg:text-base leading-5 max-w-60">
                {description}
              </p>
              <Link href={button_link || "#"} passHref>
                <button className="flex items-center gap-1.5 bg-accent px-4 py-2 rounded">
                  {button_text || "Buy now"}{" "}
                  <Image
                    className="h-3 w-3"
                    src={assets.redirect_icon}
                    alt="Redirect Icon"
                  />
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProduct;
