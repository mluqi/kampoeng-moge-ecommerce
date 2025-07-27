import React, { useMemo } from "react";
import { assets } from "../assets/assets";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { FiStar } from "react-icons/fi";
import { useCart } from "@/contexts/CartContext";
import { toast } from "react-hot-toast";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const ProductCard = ({ product }) => {
  const router = useRouter();
  const { user, wishlist, addToWishlist, removeFromWishlist } = useUserAuth();
  const { addToCart } = useCart();
  const isOutOfStock = product.product_stock <= 0;

  const isWishlisted = useMemo(
    () => wishlist.some((item) => item.product_id === product.product_id),
    [wishlist, product.product_id]
  );

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (!user) {
      router.push("/account");
      return;
    }

    if (isWishlisted) {
      removeFromWishlist(product.product_id);
      // toast.success("Removed from wishlist");
    } else {
      addToWishlist(product.product_id);
      // toast.success("Added to wishlist");
    }
  };

  const handleProductClick = () => {
    router.push("/product/" + product.product_id);
    window.scrollTo(0, 0);
  };

  const handleBuyNowClick = (e) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error("Silakan login terlebih dahulu", { icon: '🔒', position: 'top-center', style: { background: '#ff4444', color: '#fff' } });
      // router.push("/account"); // Redirect to login page
      return; 
    }

    if (isOutOfStock) return;
    
    // Add product to cart using the context
    addToCart(product.product_id);
  };

  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <FiStar key={`full-${i}`} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
        ))}
        {hasHalfStar && (
          <div className="relative w-3 h-3">
            <FiStar className="absolute w-3 h-3 text-gray-300" />
            <div className="absolute w-3 h-3 overflow-hidden" style={{ width: '50%' }}>
              <FiStar className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <FiStar key={`empty-${i}`} className="w-3 h-3 text-gray-300" />
        ))}
      </div>
    );
  };

  return (
    <div
      onClick={handleProductClick}
      className={`relative flex flex-col w-full cursor-pointer group ${
        isOutOfStock ? "opacity-75" : ""
      }`}
    >
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistClick}
        className="absolute top-3 right-3 z-10 p-2 bg-white/90 rounded-full shadow-sm hover:scale-110 transition-transform"
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <FaHeart
          className={`w-4 h-4 transition-colors ${
            isWishlisted ? "text-red-500" : "text-gray-300 group-hover:text-red-400"
          }`}
        />
      </button>

      {/* Product Image */}
      <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3">
        <Image
          src={
            product.product_pictures?.[0]
              ? baseUrl + product.product_pictures[0]
              : assets.product_placeholder
          }
          alt={product.product_name}
          className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
          width={400}
          height={400}
          priority
        />

        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-xl">
            <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded-full">
              STOK HABIS
            </span>
          </div>
        )}

        {/* Buy Now Button (Mobile) */}
        <button
          onClick={handleBuyNowClick}
          disabled={isOutOfStock}
          className="md:hidden absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 text-accent px-4 py-2 rounded-full text-sm font-medium shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
        >
          <FaShoppingCart className="inline mr-1" /> Beli
        </button>
      </div>

      {/* Product Info */}
      <div className="p-1">
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 h-[2.8em]">
          {product.product_name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-2 mb-2">
          {renderRatingStars(product.product_average_rating || 0)}
          <span className="text-xs text-gray-500">
            ({product.product_review_count || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between">
          <p className="text-lg font-bold text-gray-900">
            Rp {product.product_price?.toLocaleString("id-ID")}
          </p>

          {/* Buy Now Button (Desktop) */}
          <button
            onClick={handleBuyNowClick}
            disabled={isOutOfStock}
            className="hidden md:flex items-center gap-1 px-3 py-1.5 bg-accent text-white text-sm rounded-full hover:bg-accent/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
          >
            <FaShoppingCart className="w-3 h-3" />
            <span>Beli</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;