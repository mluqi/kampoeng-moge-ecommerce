import React from "react";
import Image from "next/image";

const ProductInfoCard = ({ product, onClick }) => {
  if (!product) return null;

  return (
    <div className="flex items-center gap-3 bg-white border rounded-lg shadow p-3 mb-2 max-w-xs">
      <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          width={64}
          height={64}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-sm">{product.name}</div>
        <div className="text-accent font-bold text-base">
          {product.price?.toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
          })}
        </div>
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
