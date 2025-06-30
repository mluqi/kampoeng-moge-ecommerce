import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  FaSquarespace,
  FaRegPlusSquare,
  FaListAlt,
  FaBookmark,
  FaShoppingCart,
} from "react-icons/fa";

const SideBar = () => {
  const pathname = usePathname();
  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: <FaSquarespace /> },
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
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default SideBar;
