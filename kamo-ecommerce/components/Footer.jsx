import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";

import { FaInstagram, FaFacebook } from "react-icons/fa";

const Footer = () => {
  return (
    <footer>
      <div className="flex flex-col md:flex-row items-start justify-center px-6 md:px-16 lg:px-32 gap-10 py-14 text-gray-500 border-t border-gray-200">
        <div className="w-4/5">
          <Image className="w-28 md:w-32" src={assets.logo_accent} alt="logo" />
          <p className="mt-6 text-sm">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book.
          </p>
        </div>

        <div className="w-1/2 flex items-center justify-start md:justify-center">
          <div>
            <h2 className="font-medium text-gray-900 mb-5">KampoengMoge</h2>
            <ul className="text-sm space-y-2">
              <li>
                <a className="hover:underline transition" href="/">
                  Home
                </a>
              </li>
              <li>
                <a className="hover:underline transition" href="/shop">
                  Belanja
                </a>
              </li>
              <li>
                <a className="hover:underline transition" href="/about-us">
                  Tentang Kami
                </a>
              </li>
              <li>
                <a className="hover:underline transition" href="/contact">
                  Kontak
                </a>
              </li>
              <li>
                <a
                  className="hover:underline transition"
                  href="/terms-and-conditions"
                >
                  Syarat dan Ketentuan
                </a>
              </li>
              <li>
                <a
                  className="hover:underline transition"
                  href="/privacy-policy"
                >
                  Kebijakan Privasi
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="w-1/2 flex items-start justify-start md:justify-center">
          <div>
            <h2 className="font-medium text-gray-900 mb-5">Kontak Kami</h2>
            <div className="text-sm space-y-2">
              <p>+1-234-567-890</p>
              <p>contact@greatstack.dev</p>
            </div>
          </div>
        </div>
        <div className="w-1/2 flex items-start justify-start md:justify-center">
          <div>
            <h2 className="font-medium text-gray-900 mb-5">Sosial Media</h2>
            <div className="text-sm space-y-2 flex md:flex-row gap-4">
              <a href="https://www.instagram.com/kampoengmoge/">
                <FaInstagram />
              </a>
              <a href="https://www.facebook.com/kampoengmogeparts">
                <FaFacebook />
              </a>
            </div>
          </div>
        </div>
      </div>
      <p className="py-4 text-center text-xs md:text-sm bg-accent/90 text-white">
        Copyright © {new Date().getFullYear()} PalindoDev All Right Reserved.
      </p>
    </footer>
  );
};

export default Footer;
