"use client";

import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import api from "@/service/api";
import { FaInstagram, FaFacebook, FaTiktok, FaYoutube } from "react-icons/fa";

const Footer = () => {
  const [settings, setSettings] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // API ini sudah mengelompokkan data berdasarkan 'group'
        const res = await api.get("/settings");
        setSettings(res.data);
      } catch (error) {
        console.error("Gagal memuat pengaturan footer:", error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer>
      <div className="flex flex-col md:flex-row items-start justify-center px-6 md:px-16 lg:px-32 gap-10 py-14 text-gray-500 border-t border-gray-200">
        <div className="w-4/5">
          <Image
            className="w-28 md:w-32"
            src={settings?.footer?.logo_url ? `${baseUrl}${settings.footer.logo_url}` : assets.logo}
            alt="logo"
            width={128}
            height={40}
          />
          <p className="mt-6 text-sm">
            {settings?.footer?.description || "Memuat deskripsi..."}
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
              <p>{settings?.footer?.phone || "..."}</p>
              <p>{settings?.footer?.email || "..."}</p>
            </div>
          </div>
        </div>
        <div className="w-1/2 flex items-start justify-start md:justify-center">
          <div>
            <h2 className="font-medium text-gray-900 mb-5">Sosial Media</h2>
            <div className="text-sm space-y-2 flex md:flex-row gap-4">
              <a
                href={settings?.footer?.instagram_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition"
              >
                <FaInstagram />
              </a>
              <a
                href={settings?.footer?.facebook_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition"
              >
                <FaFacebook />
              </a>
              <a
                href={settings?.footer?.tiktok_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition"
              >
                <FaTiktok />
              </a>
              <a
                href={settings?.footer?.youtube_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition"
              >
                <FaYoutube />
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
