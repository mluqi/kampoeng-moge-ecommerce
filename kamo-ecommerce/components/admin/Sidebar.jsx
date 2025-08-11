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
  FaImages,
  FaChartLine
} from "react-icons/fa";
import { BiSolidBookContent } from "react-icons/bi";

const SideBar = () => {
  const pathname = usePathname();
  const { totalUnreadCount } = useAdminChat();

  const menuGroups = [
    {
      title: "Dashboard",
      items: [{ name: "Dashboard", path: "/admin", icon: <FaTachometerAlt /> }],
    },
    {
      title: "Customer",
      items: [
        { name: "Orders", path: "/admin/orders", icon: <FaShoppingCart /> },
        { name: "Chat", path: "/admin/chat", icon: <FaEnvelope /> },
        { name: "Reviews", path: "/admin/reviews", icon: <FaComment /> },
      ],
    },
    {
      title: "Products",
      items: [
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
        {
          name: "Analytics",
          path: "/admin/analytics",
          icon: <FaChartLine />,
        },
        { name: "Category", path: "/admin/category", icon: <FaBookmark /> },
        {
          name: "Featured Products",
          path: "/admin/featured-product",
          icon: <FaStar />,
        },
      ],
    },
    {
      title: "Content",
      items: [
        {
          name: "Contents",
          path: "/admin/content",
          icon: <BiSolidBookContent />,
        },
        {
          name: "Homepage Manager",
          path: "/admin/homepage-manager",
          icon: <FaImages />,
        },
        {
          name: "Footer Setting",
          path: "/admin/footer-setting",
          icon: <FaEdit />,
        },
      ],
    },

    {
      title: "Settings",
      items: [{ name: "Settings", path: "/admin/settings", icon: <FaCog /> }],
    },
  ];

  return (
    <div className="md:w-64 w-16 border-r min-h-screen text-base border-gray-300 py-2 flex flex-col">
      {menuGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="mb-4">
          {/* Group Title (visible only in expanded mode) */}
          <div className="hidden md:block px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {group.title}
          </div>

          {/* Menu Items */}
          {group.items.map((item) => {
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
      ))}
    </div>
  );
};

export default SideBar;
