"use client";
import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCategory } from "@/contexts/CategoryContext";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import { FiChevronRight } from "react-icons/fi";
import Image from "next/image";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const CategoriesPage = () => {
  const { categories, loading, fetchCategories } = useCategory();
  const router = useRouter();

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [fetchCategories, categories.length]);

  return (
    <>
      <Navbar />
      <div className="min-h-[70vh] px-4 sm:px-6 lg:px-32 py-14 pb-24 md:pb-14">
        <div className="flex flex-col items-start w-full max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-medium text-gray-800 mb-2">
            Semua Kategori
          </h1>
          <div className="w-24 h-1 bg-accent rounded-full mb-8"></div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loading />
          </div>
        ) : (
          <>
            {/* Mobile List View */}
            <div className="flex flex-col space-y-4 md:hidden">
              {categories.map((cat) => (
                <div
                  key={cat.category_id}
                  onClick={() => router.push(`/category/${cat.category_id}`)}
                  className="flex items-center gap-4 p-3 bg-white rounded-lg shadow-sm border border-gray-100"
                >
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                    {cat.category_image ? (
                      <Image
                        src={baseUrl + cat.category_image}
                        alt={cat.category_name}
                        fill
                        className="object-cover"
                        quality={80}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-xs text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 truncate">
                      {cat.category_name}
                    </h3>
                  </div>
                  <FiChevronRight className="text-gray-400" />
                </div>
              ))}
            </div>

            {/* Desktop Grid View */}
            <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 max-w-7xl mx-auto">
              {categories.map((cat) => (
                <div
                  key={cat.category_id}
                  onClick={() => router.push(`/category/${cat.category_id}`)}
                  className="group cursor-pointer flex flex-col items-center rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg"
                >
                  <div className="relative w-full aspect-square overflow-hidden">
                    {cat.category_image ? (
                      <>
                        <Image
                          src={baseUrl + cat.category_image}
                          alt={cat.category_name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          quality={90}
                          sizes="(max-width: 1024px) 33vw, 20vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </>
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>

                  <div className="w-full p-3 text-center bg-white">
                    <h3 className="font-medium text-gray-800 group-hover:text-accent transition-colors line-clamp-1">
                      {cat.category_name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CategoriesPage;
