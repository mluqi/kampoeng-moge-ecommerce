import React from "react";
import Image from "next/image";
import { assets } from "@/assets/assets";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const ProductInfoCard = ({ product, onClick, className = "" }) => {
  if (!product) return null;

  const imageUrl = product.product_pictures?.[0]
    ? baseUrl + product.product_pictures[0]
    : assets.product_placeholder;

  return (
    <div
      className={`flex items-center gap-3 bg-white border rounded-lg shadow p-3 ${className}`}
    >
      <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-100">
        <Image
          src={imageUrl}
          alt={product.product_name || "Product Image"}
          width={64}
          height={64}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-sm line-clamp-2">
          {product.product_name}
        </div>
        {product.product_is_discount && product.product_discount_status ? (
          <div>
            <div className="flex items-center gap-1">
            <p className="text-xs text-gray-500 line-through">
              {product.product_price?.toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              })}
            </p>
            <span className="text-xs text-white bg-[#F84B62] px-1 rounded mr-2">
              {product.product_discount_percentage}%
            </span>

            </div>
            <p className="text-[#F84B62] font-bold text-base">
              {product.product_discount_price?.toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              })}
            </p>
          </div>
        ) : (
          <div className="text-accent font-bold text-base">
            {product.product_price?.toLocaleString("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            })}
          </div>
        )}
        <button
          onClick={onClick}
          className="mt-1 text-xs text-white bg-accent px-3 py-1 rounded hover:bg-accent/90"
        >
          Lihat Detail
        </button>
      </div>
    </div>
  );
};

export default ProductInfoCard;
