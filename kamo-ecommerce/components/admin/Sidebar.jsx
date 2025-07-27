"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminChat } from "@/contexts/AdminChatContext";

import {
  FaRegPlusSquare,
  FaListAlt,
  FaBookmark,
  FaShoppingCart,
  FaEnvelope,
  FaComment,
  FaTachometerAlt,
  FaCog,
  FaEdit,
  FaStar,
  FaImages
} from "react-icons/fa";
import { BiSolidBookContent } from "react-icons/bi";

const SideBar = () => {
  const pathname = usePathname();
  const { totalUnreadCount } = useAdminChat();
  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: <FaTachometerAlt /> },
    {
      name: "Add Product",
      path: "/admin/add-product",
      icon: <FaRegPlusSquare />,
    },
    {
      name: "Product List",
      path: "/admin/product-list",
      icon: <FaListAlt />,
    },
    { name: "Category", path: "/admin/category", icon: <FaBookmark /> },
    { name: "Orders", path: "/admin/orders", icon: <FaShoppingCart /> },
    { name: "Chat", path: "/admin/chat", icon: <FaEnvelope /> },
    { name: "Reviews", path: "/admin/reviews", icon: <FaComment /> },
    { name: "Contents", path: "/admin/content", icon: <BiSolidBookContent /> },
    { name: "Footer Setting", path: "/admin/footer-setting", icon: <FaEdit /> },
    { name: "Featured Products", path: "/admin/featured-product", icon: <FaStar /> },
    { name: "Homepage Manager", path: "/admin/homepage-manager", icon: <FaImages /> },
    { name: "Settings", path: "/admin/settings", icon: <FaCog /> },
  ];

  return (
    <div className="md:w-64 w-16 border-r min-h-screen text-base border-gray-300 py-2 flex flex-col">
      {menuItems.map((item) => {
        const isActive = pathname === item.path;

        return (
          <Link href={item.path} key={item.name} passHref>
            <div
              className={`flex items-center py-3 px-4 gap-3 ${
                isActive
                  ? "border-r-4 md:border-r-[6px] bg-accent/10 border-accent/90"
                  : "hover:bg-gray-100/90 border-white"
              }`}
            >
              <div className="text-xl text-accent hover:text-accent">
                {item.icon}
              </div>
              <p className="md:block hidden text-center">{item.name}</p>
              {item.name === "Chat" && totalUnreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalUnreadCount}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default SideBar;
