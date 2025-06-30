"use client";
import { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import { useProduct } from "@/contexts/ProductContext";
import api from "@/service/api";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const Product = () => {
  const { id } = useParams();
  const router = useRouter();
  // const { addToCart } = useAppContext();
  const { fetchProductById } = useProduct();

  const [mainImage, setMainImage] = useState(null);
  const [productData, setProductData] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  // 1. Ambil data produk utama berdasarkan ID dari URL
  useEffect(() => {
    let isMounted = true;
    // Pastikan data lama dibersihkan saat ID berubah
    setProductData(null);

    const getProduct = async () => {
      const product = await fetchProductById(id);
      if (isMounted && product) {
        setProductData(product);
        setMainImage(product.product_pictures?.[0] || null);
      }
    };

    getProduct();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // 2. Ambil produk terkait setelah data produk utama tersedia
  useEffect(() => {
    if (productData?.product_category) {
      const fetchRelated = async () => {
        setLoadingRelated(true);
        const res = await api.get(`/products?category=${productData.product_category}&limit=6`);
        // Filter produk saat ini dari hasil dan batasi hingga 5
        const filtered = res.data.data.filter(p => p.product_id !== id).slice(0, 5);
        setRelatedProducts(filtered);
        setLoadingRelated(false);
      };
      fetchRelated();
    }
  }, [productData, id]);

  return productData ? (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="px-5 lg:px-16 xl:px-20">
            <div className="rounded-lg overflow-hidden bg-gray-500/10 mb-4">
              <Image
                src={
                  mainImage ? baseUrl + mainImage : assets.product_placeholder
                }
                alt={productData.product_name || "Product Image"}
                className="w-full h-auto object-cover mix-blend-multiply"
                width={1280}
                height={720}
                priority
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {productData.product_pictures?.map((image, index) => (
                <div
                  key={index}
                  onClick={() => setMainImage(image)}
                  className={`cursor-pointer rounded-lg overflow-hidden bg-gray-500/10 border-2 ${
                    mainImage === image ? "border-accent" : "border-transparent"
                  }`}
                >
                  <Image
                    src={baseUrl + image}
                    alt={`${productData.product_name || "Product"} thumbnail ${
                      index + 1
                    }`}
                    className="w-full h-auto object-cover mix-blend-multiply"
                    width={1280}
                    height={720}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-medium text-gray-800/90 mb-4">
              {productData.product_name}
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                <Image
                  className="h-4 w-4"
                  src={assets.star_icon}
                  alt="star_icon"
                />
                <Image
                  className="h-4 w-4"
                  src={assets.star_icon}
                  alt="star_icon"
                />
                <Image
                  className="h-4 w-4"
                  src={assets.star_icon}
                  alt="star_icon"
                />
                <Image
                  className="h-4 w-4"
                  src={assets.star_icon}
                  alt="star_icon"
                />
                <Image
                  className="h-4 w-4"
                  src={assets.star_dull_icon}
                  alt="star_dull_icon"
                />
              </div>
              <p>(4.5)</p>
            </div>
            <p className="text-gray-600 mt-3">
              {productData.product_description}
            </p>
            <p className="text-3xl font-medium mt-6">
              Rp {(productData.product_price || 0).toLocaleString("id-ID")}
            </p>
            <hr className="bg-gray-600 my-6" />
            <div className="overflow-x-auto">
              <table className="table-auto border-collapse w-full max-w-72">
                <tbody>
                  <tr>
                    <td className="text-gray-600 font-medium">Brand</td>
                    <td className="text-gray-800/50 ">Generic</td>
                  </tr>
                  <tr>
                    <td className="text-gray-600 font-medium">Color</td>
                    <td className="text-gray-800/50 ">Multi</td>
                  </tr>
                  <tr>
                    <td className="text-gray-600 font-medium">Category</td>
                    <td className="text-gray-800/50">
                      {typeof productData.category === "object"
                        ? productData.category.category_name
                        : productData.category}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex items-center mt-10 gap-4">
              <button
                // onClick={() => addToCart(productData.product_id)}
                className="w-full py-3.5 bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition"
              >
                Tambah ke Keranjang
              </button>
              <button
                onClick={() => {
                  // addToCart(productData.product_id);
                  router.push("/cart");
                }}
                className="w-full py-3.5 bg-accent/90 text-white hover:bg-accent transition"
              >
                Beli Sekarang
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center mb-4 mt-16">
            <p className="text-3xl font-medium">
              Produk{" "}
              <span className="font-medium text-accent/90">Unggulan</span>
            </p>
            <div className="w-28 h-0.5 bg-accent/90 mt-2"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
            {loadingRelated ? (
              <p className="col-span-full text-center">Memuat produk terkait...</p>
            ) : relatedProducts.length > 0 ? (
              relatedProducts.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))
            ) : (
              <p className="col-span-full text-center">
                Tidak ada produk terkait yang ditemukan.
              </p>
            )}
          </div>
          <button
            onClick={() => {
              router.push("/all-products");
            }}
            className="px-8 py-2 mb-16 border rounded text-gray-500/70 hover:bg-slate-50/90 transition"
          >
            Lihat Selengkapnya
          </button>
        </div>
      </div>
      <Footer />
    </>
  ) : (
    <Loading />
  );
};

export default Product;
