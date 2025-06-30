import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";

const products = [
  {
    id: 1,
    image: assets.login_banner_1,
    title: "Gagah & Berani",
    description: "Tampil dominan di jalanan dengan aksesoris moge berkualitas.",
  },
  {
    id: 2,
    image: assets.login_banner_2,
    title: "Kebebasan Tanpa Batas",
    description:
      "Jelajahi setiap tikungan dengan performa dan gaya tak tertandingi.",
  },
  {
    id: 3,
    image: assets.login_banner_3,
    title: "Gaya Klasik Modern",
    description:
      "Padukan keanggunan klasik dan teknologi modern untuk moge impianmu.",
  },
];

const FeaturedProduct = () => {
  return (
    <div className="mt-14">
      <div className="flex flex-col items-center">
        <p className="text-3xl font-medium">Produk Unggulan</p>
        <div className="w-28 h-0.5 bg-accent mt-2"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-14 mt-12 md:px-14 px-4">
        {products.map(({ id, image, title, description }) => (
          <div key={id} className="relative group aspect-[3/4] overflow-hidden rounded-lg">
            <Image
              src={image}
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
              <button className="flex items-center gap-1.5 bg-accent px-4 py-2 rounded">
                Buy now{" "}
                <Image
                  className="h-3 w-3"
                  src={assets.redirect_icon}
                  alt="Redirect Icon"
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProduct;
