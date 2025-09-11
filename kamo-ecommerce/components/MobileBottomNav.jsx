"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { FaHome, FaStore, FaThList, FaShoppingCart, FaTags } from "react-icons/fa";
import { CategoryIcon, IconDiskon } from "@/assets/assets";

const MobileBottomNav = () => {
  const pathname = usePathname();
  const { cartCount } = useCart();

  const navItems = [
    { href: "/", label: "Home", icon: <FaHome size={20} /> },
    { href: "/all-products", label: "Produk", icon: <FaStore size={20} /> },
    { href: "/discount", label: "Diskon", icon: <IconDiskon /> },
    { href: "/category", label: "Kategori", icon: <CategoryIcon /> },
    {
      href: "/cart",
      label: "Keranjang",
      icon: <FaShoppingCart size={20} />,
      badge: cartCount,
    },
  ];

  // Jangan tampilkan navigasi di halaman admin atau login
  if (pathname.startsWith("/admin") || pathname.startsWith("/account")) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:hidden z-40">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link href={item.href} key={item.label} className="flex-1">
              <div
                className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors duration-200 ${
                  isActive ? "text-accent" : "text-gray-500 hover:text-accent"
                }`}
              >
                <div className="relative">
                  {item.icon}
                  {item.badge > 0 && (
                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
