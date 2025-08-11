"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "highest-price", label: "Harga Tertinggi" },
  { value: "lowest-price", label: "Harga Terendah" },
  { value: "most-sold", label: "Terjual Terbanyak" },
];

export default function ProductFilterBar({
  categories = [],
  selectedCategory,
  onCategoryChange,
  selectedSort,
  onSortChange,
}) {
  const router = useRouter();
  const [xPos, setXPos] = useState(0);
  const animRef = useRef(null);
  const containerRef = useRef(null);

  const allSlides = [
    ...categories.map((cat) => ({
      id: cat.category_id,
      type: "category",
      label: cat.category_name,
      image: cat.category_image
        ? baseUrl + cat.category_image
        : "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
    })),
    {
      id: "other",
      type: "other",
      label: "Other",
      image:
        "https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const infiniteSlides = [...allSlides, ...allSlides, ...allSlides];
  const slideWidth = 128 + 12;
  const totalWidth = allSlides.length * slideWidth;

  // Animasi custom
  useEffect(() => {
    startScroll();
    return () => stopScroll();
  }, []);

  const startScroll = () => {
    if (!animRef.current) {
      animRef.current = requestAnimationFrame(function loop() {
        setXPos((prev) => {
          const speed = 1;
          const newPos = prev - speed;
          return newPos <= -totalWidth ? 0 : newPos;
        });
        animRef.current = requestAnimationFrame(loop);
      });
    }
  };

  const stopScroll = () => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
  };

  const handleSlideClick = (slide) => {
    if (slide.type === "all") {
      onCategoryChange("");
    } else if (slide.type === "category") {
      router.push(`/category/${slide.id}`);
    } else if (slide.type === "other") {
      router.push("/category");
    }
  };

  const isSelected = (slide) => {
    if (slide.type === "all") return selectedCategory === "";
    if (slide.type === "category") return selectedCategory === slide.id;
    if (slide.type === "other") return selectedCategory === "other";
    return false;
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Category Boxes with Pause on Hover + Drag */}
      <div
        className="overflow-hidden mb-2 cursor-grab active:cursor-grabbing"
        ref={containerRef}
        onMouseEnter={stopScroll}
        onMouseLeave={startScroll}
      >
        <motion.div
          className="flex gap-3"
          drag="x"
          dragConstraints={{
            left: -totalWidth,
            right: 0,
          }}
          dragElastic={0.1}
          style={{
            x: xPos,
            width: `${infiniteSlides.length * slideWidth}px`,
          }}
        >
          {infiniteSlides.map((slide, index) => (
            <motion.button
              key={`${slide.id}-${index}`}
              onClick={() => handleSlideClick(slide)}
              className={`relative h-32 w-32 rounded-lg overflow-hidden transition-all cursor-pointer
                flex items-end p-3 bg-cover bg-center flex-shrink-0
                ${isSelected(slide) ? "ring-2 ring-accent ring-offset-2" : ""}`}
              style={{
                backgroundImage: `url('${slide.image}')`,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-white font-medium text-sm drop-shadow-md">
                {slide.label}
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Sort Dropdown */}
      <div className="flex gap-3 p-2 bg-gray-50 rounded-lg max-w-fit">
        <select
          value={selectedSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 bg-white text-gray-800 
                    text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 cursor-pointer min-w-[150px]"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
