"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminChat } from "@/contexts/AdminChatContext";
import { useAuth } from "../../contexts/AuthContext";
import { useAppContext } from "@/contexts/AppContext";
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
  FaChartLine,
  FaChartArea,
  FaCartPlus,
  FaChevronLeft,
  FaTimes,
  FaSignOutAlt,
} from "react-icons/fa";
import { BiSolidBookContent } from "react-icons/bi";
const SideBar = ({
  isMobileOpen,
  onCloseMobile,
  isExpanded,
  setIsExpanded,
}) => {
  const pathname = usePathname();
  const { totalUnreadCount } = useAdminChat();
  const { logoutAdmin } = useAuth();
  const { router } = useAppContext();

  const handleLogout = async () => {
    const result = await logoutAdmin();
    if (result.success) {
      router.push("/account");
    }
    if (onCloseMobile) onCloseMobile();
  };

  const menuGroups = [
    {
      title: "Dashboard",
      items: [{ name: "Dashboard", path: "/admin", icon: <FaTachometerAlt /> }],
    },
    {
      title: "Customer",
      items: [
        { name: "Orders", path: "/admin/orders", icon: <FaShoppingCart /> },
        {
          name: "Orders Tiktok",
          path: "/admin/orders-tiktok",
          icon: <FaCartPlus />,
        },
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
          name: "Analytics Product Views",
          path: "/admin/analytics",
          icon: <FaChartLine />,
        },
        {
          name: "Analytics Cart",
          path: "/admin/analytics-cart",
          icon: <FaChartArea />,
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
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/40 z-[99] md:hidden transition-opacity ${
          isMobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onCloseMobile}
      />
      <div
        className={`
          fixed top-0 left-0 z-[100] h-full bg-white border-r border-gray-300 flex flex-col transition-all duration-300
          ${isExpanded ? "md:w-64" : "md:w-16"} w-64
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
        style={{ maxWidth: "100vw" }}
      >
        {/* Sidebar Header */}
        <div
          className={`flex items-center border-b border-gray-200 h-[50px] shrink-0 ${
            isExpanded ? "px-4" : "px-2"
          }`}
        >
          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden ml-auto p-2 rounded-full hover:bg-gray-100"
          >
            <FaTimes size={22} />
          </button>

          {/* Desktop expand/collapse button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`hidden md:flex p-2 rounded-full hover:bg-gray-100 ${
              isExpanded ? "ml-auto" : "mx-auto"
            }`}
          >
            <FaChevronLeft
              className={`transition-transform duration-300 ${
                !isExpanded && "rotate-180"
              }`}
            />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-4">
              {/* Group Title (visible only in expanded mode) */}
              <div
                className={`px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider ${
                  !isExpanded && "md:hidden"
                }`}
              >
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
                          : "hover:bg-gray-100/90 border-r-4 border-transparent"
                      }`}
                      onClick={onCloseMobile}
                    >
                      <div className="text-xl text-accent">{item.icon}</div>
                      <p
                        className={`whitespace-nowrap ${
                          !isExpanded && "md:hidden"
                        }`}
                      >
                        {item.name}
                      </p>
                      {item.name === "Chat" && totalUnreadCount > 0 && (
                        <span
                          className={`ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ${
                            !isExpanded && "md:hidden"
                          }`}
                        >
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
        {/* Logout button */}
        <div className="mt-auto p-2 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2 p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 ${
              isExpanded ? "justify-start px-3" : "justify-center"
            }`}
          >
            <FaSignOutAlt />
            <span className={`${!isExpanded && "md:hidden"}`}>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default SideBar;
