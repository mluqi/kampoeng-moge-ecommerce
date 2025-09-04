"use client";
import { useEffect, useState, useMemo } from "react";
import { assets } from "@/assets/assets";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter, usePathname } from "next/navigation";
import Loading from "@/components/Loading";
import { useProduct } from "@/contexts/ProductContext";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useCart } from "@/contexts/CartContext";
import {
  FaHeart,
  FaShoppingCart,
  FaArrowRight,
  FaCommentDots,
} from "react-icons/fa";
import StarRating from "@/components/StarRating";
import api from "@/service/api";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import { LabelDiskon } from "@/assets/assets";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const ProductDetailClient = ({ initialProductData }) => {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { fetchProductById } = useProduct();
  const { addToCart } = useCart();
  const { user, wishlist, addToWishlist, removeFromWishlist } = useUserAuth();
  const { startChatWithProduct } = useChat();

  const [productData, setProductData] = useState(initialProductData);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  // --- LOGIKA PENCATATAN VIEW ---
  useEffect(() => {
    if (!id) return;
    const viewedKey = `viewed_product_${id}`;
    const hasViewedInSession = sessionStorage.getItem(viewedKey);
    if (!hasViewedInSession) {
      sessionStorage.setItem(viewedKey, "true");
      const recordView = async () => {
        try {
          await api.post(`/products/${id}/view`);
        } catch (error) {
          console.error("Gagal mencatat tampilan produk:", error);
        }
      };
      recordView();
    }
  }, [id]);

  // Fetch main product data when the ID changes on the client
  useEffect(() => {
    const getProduct = async () => {
      setProductData(null); // Show loading state for the new product
      try {
        const product = await fetchProductById(id);
        if (product) {
          setProductData(product);
        } else {
          // Handle case where product is not found on client-side navigation
          toast.error("Produk tidak ditemukan.");
          router.push("/not-found");
        }
      } catch (error) {
        toast.error("Gagal memuat produk.");
      }
    };

    // Only fetch if the new ID is different from the initial data's ID
    if (id && id !== initialProductData.product_id) {
      getProduct();
    }
  }, [id, initialProductData.product_id, fetchProductById, router]);

  // Fetch related products
  useEffect(() => {
    if (productData?.product_category) {
      const fetchRelated = async () => {
        setLoadingRelated(true);
        try {
          const res = await api.get(
            `/products/all-products?category=${productData.product_category}&limit=6&offset=0&status=active`
          );
          const filtered = res.data.data
            .filter((p) => p.product_stock > 0)
            .filter((p) => p.product_id !== id)
            .slice(0, 5);
          setRelatedProducts(filtered);
        } catch (error) {
          toast.error("Gagal memuat produk terkait");
        }
        setLoadingRelated(false);
      };
      fetchRelated();
    }
  }, [productData, id]);

  // Fetch reviews
  useEffect(() => {
    if (id) {
      const fetchReviews = async () => {
        setLoadingReviews(true);
        try {
          const res = await api.get(`/reviews/product/${id}`);
          setReviews(res.data);
        } catch (error) {
          toast.error("Gagal memuat ulasan");
        }
        setLoadingReviews(false);
      };
      fetchReviews();
    }
  }, [id]);

  const isOutOfStock = productData && productData.product_stock <= 0;
  const isWishlisted = useMemo(
    () =>
      productData &&
      wishlist.some((item) => item.product_id === productData.product_id),
    [wishlist, productData]
  );

  const handleWishlistClick = () => {
    if (!user) {
      router.push(`/account?callbackUrl=${pathname}`);
      return;
    }
    if (isWishlisted) {
      removeFromWishlist(productData.product_id);
    } else {
      addToWishlist(productData.product_id);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Silakan login terlebih dahulu", {
        icon: "🔒",
        position: "top-center",
        style: { background: "#ff4444", color: "#fff" },
      });
      router.push(`/account?callbackUrl=${pathname}`);
      return;
    }
    addToCart(productData.product_id);
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.error("Silakan login terlebih dahulu", {
        icon: "🔒",
        position: "top-center",
        style: { background: "#ff4444", color: "#fff" },
      });
      router.push(`/account?callbackUrl=${pathname}`);
      return;
    }
    addToCart(productData.product_id);
    router.push("/cart");
  };

  const handleAskAdmin = () => {
    if (!user) {
      toast.error("Silakan login untuk memulai chat.", {
        icon: "🔒",
        position: "top-center",
        style: { background: "#ff4444", color: "#fff" },
      });
      router.push(`/account?callbackUrl=${pathname}`);
      return;
    }
    const productInfo = {
      id: productData.product_id,
      name: productData.product_name,
      price: productData.product_price,
      image: productData.product_pictures?.[0]
        ? baseUrl + productData.product_pictures[0]
        : assets.product_placeholder.src,
    };
    startChatWithProduct(productInfo);
  };

  const handleCategoryDirect = () => {
    if (typeof productData.category === "object") {
      return () => router.push(`/category/${productData.category.category_id}`);
    } else {
      return () => router.push(`/category/${productData.category}`);
    }
  };

  if (!productData) {
    return <Loading />;
  }

  return (
    <div className="px-4 md:px-8 lg:px-16 pt-8 pb-16 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center hover:text-accent"
        >
          <FiChevronLeft className="mr-1" /> Kembali
        </button>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{productData.product_name}</span>
      </div>

      {/* Product Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div className="relative">
          <Swiper
            modules={[FreeMode, Navigation, Thumbs]}
            spaceBetween={10}
            loop={true}
            navigation={{
              nextEl: ".swiper-button-next-custom",
              prevEl: ".swiper-button-prev-custom",
            }}
            thumbs={{
              swiper:
                thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
            }}
            className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-4"
          >
            {productData.product_pictures?.length > 0 ? (
              productData.product_pictures.map((image, index) => (
                <SwiperSlide key={index}>
                  <Image
                    src={baseUrl + image}
                    alt={`Produk ${productData.product_name} ${index + 1}`}
                    className="object-contain w-full h-full"
                    width={800}
                    height={800}
                    priority={index === 0}
                  />
                </SwiperSlide>
              ))
            ) : (
              <SwiperSlide>
                <Image
                  src={assets.product_placeholder}
                  alt={productData.product_name}
                  className="object-contain w-full h-full"
                  width={800}
                  height={800}
                  priority
                />
              </SwiperSlide>
            )}
            {/* Custom Navigation Buttons */}
            <button className="swiper-button-prev-custom absolute top-1/2 -translate-y-1/2 left-4 z-10 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition disabled:opacity-0">
              <FiChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button className="swiper-button-next-custom absolute top-1/2 -translate-y-1/2 right-4 z-10 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition disabled:opacity-0">
              <FiChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </Swiper>

          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={10}
            slidesPerView={4}
            freeMode={true}
            loop={true}
            watchSlidesProgress={true}
            modules={[FreeMode, Navigation, Thumbs]}
            className="h-24"
          >
            {productData.product_pictures?.map((image, index) => (
              <SwiperSlide
                key={index}
                className="cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-accent [&.swiper-slide-thumb-active]:border-black"
              >
                <Image
                  src={baseUrl + image}
                  alt={`Thumbnail ${index + 1}`}
                  className="object-cover w-full h-full"
                  width={200}
                  height={200}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {productData.product_name}
            </h1>
            <button
              onClick={handleWishlistClick}
              className="p-2 text-lg"
              aria-label={
                isWishlisted ? "Hapus dari wishlist" : "Tambahkan ke wishlist"
              }
            >
              <FaHeart
                className={`transition-colors ${
                  isWishlisted
                    ? "text-red-500"
                    : "text-gray-300 hover:text-red-400"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <StarRating
              rating={productData.product_average_rating || 0}
              size={20}
            />
            <span className="text-sm text-gray-500">
              {productData.product_review_count > 0
                ? `(${productData.product_review_count} ulasan)`
                : "(Belum ada ulasan)"}
            </span>
          </div>

          {productData.product_is_discount && (
            <span className="text-lg text-gray-500 line-through">
              Rp {productData.product_price?.toLocaleString("id-ID")}
            </span>
          )}
          <div className="mb-3 p-4 bg-gray-50 rounded-lg relative">
            {productData.product_is_discount && (
              <div className="absolute top-0 left-0 text-white">
                <div className="relative w-14 h-14 -translate-x-3 md:-translate-y-0 -translate-y-1">
                  <LabelDiskon className="text-[#F84B62]" />
                  <div className="absolute bottom-4 right-2 text-white inset-0 flex items-center justify-center text-xs font-bold transform">
                    {productData.product_discount_percentage}%
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                {productData.product_is_discount ? (
                  <span className="text-3xl font-bold mt-2 md:mt-0 md:ml-6 text-[#F84B62]">
                    Rp{" "}
                    {productData.product_discount_price?.toLocaleString(
                      "id-ID"
                    )}
                  </span>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">
                    Rp{" "}
                    {productData.product_price?.toLocaleString(
                      "id-ID"
                    )}
                  </span>
                )}
              </div>
              {isOutOfStock && (
                <span className="ml-auto px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                  Stok Habis
                </span>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Deskripsi Produk</h3>
            <div
              className="prose max-w-none text-gray-600"
              dangerouslySetInnerHTML={{
                __html: productData.product_description || "",
              }}
            ></div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {productData.product_brand ? (
              <Link
                href={`/brand/${encodeURIComponent(productData.product_brand)}`}
                className="bg-gray-50 text-accent p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition"
              >
                <p className="text-sm text-gray-500">Brand</p>
                <p className="font-medium font-semibold text-accent">
                  {productData.product_brand}
                </p>
              </Link>
            ) : (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Brand</p>
                <p className="font-medium">Tidak tersedia</p>
              </div>
            )}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Kondisi</p>
              <p className="font-medium">{productData.product_condition}</p>
            </div>
            <div
              className="bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition"
              onClick={handleCategoryDirect()}
            >
              <p className="text-sm text-gray-500">Kategori</p>
              <p className="font-medium font-semibold text-accent">
                {typeof productData.category === "object"
                  ? productData.category.category_name
                  : productData.category}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Stok Tersedia</p>
              <p className="font-medium">{productData.product_stock}</p>
            </div>
          </div>

          <div className="mt-auto space-y-3">
            <div className="grid grid-cols-5 gap-4">
              <button
                onClick={handleAskAdmin}
                className="p-3 bg-accent hover:bg-accent/90 text-white rounded-lg transition flex items-center justify-center"
              >
                <FaCommentDots className="text-lg" />
              </button>
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="col-span-4 flex items-center justify-center gap-2 py-3 border-2 border-accent text-accent hover:bg-accent/10 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaShoppingCart />
                Tambah ke Keranjang
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent/90 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Beli Sekarang
              <FaArrowRight />
            </button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <section className="mt-16">
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-2xl font-bold text-center">
            Produk <span className="text-accent">Terkait</span>
          </h2>
          <div className="w-24 h-1 bg-accent rounded-full mt-2"></div>
        </div>

        {loadingRelated ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 rounded-lg aspect-[3/4] animate-pulse"
              ></div>
            ))}
          </div>
        ) : relatedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Tidak ada produk terkait yang ditemukan.
            </p>
          </div>
        )}

        <div className="flex justify-center mt-8">
          <button
            onClick={() => router.push("/all-products")}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
          >
            Lihat Semua Produk <FiChevronRight />
          </button>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="mt-16 pt-8 border-t">
        <h2 className="text-2xl font-bold mb-6">Ulasan Produk</h2>

        {loadingReviews ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="flex gap-4 pb-6 border-b last:border-0"
              >
                <div className="flex-shrink-0">
                  <Image
                    src={review.user.user_photo || assets.icon}
                    alt={review.user.user_name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover w-12 h-12"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <h3 className="font-semibold">{review.user.user_name}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <StarRating rating={review.rating} size={16} />
                  {review.comment && (
                    <p className="mt-2 text-gray-700 whitespace-pre-line">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-600">Belum ada ulasan untuk produk ini.</p>
            <p className="text-sm text-gray-400 mt-1">
              Jadilah yang pertama memberikan ulasan!
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductDetailClient;
