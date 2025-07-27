/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/service/api";
import Loading from "@/components/Loading";

const KebijakanPrivasi = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await api.get("/content/privacy_policy");
        setContent(res.data);
      } catch (error) {
        console.error("Failed to fetch content:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-14 md:pb-18">
        <div className="flex flex-col items-start">
          <div className="flex flex-col items-end pt-8 md:pt-12">
            <p className="text-2xl md:text-3xl font-medium">
              {loading ? "Memuat..." : content?.content_title || "Kebijakan Privasi"}
            </p>
            <div className="w-16 h-0.5 bg-accent rounded-full mt-1"></div>
          </div>

          {loading ? (
            <Loading />
          ) : (
            <div className="mt-8 md:mt-12 text-gray-700 space-y-4 prose max-w-none"
              dangerouslySetInnerHTML={{ __html: content?.content_value || "<p>Konten tidak tersedia.</p>" }}
            />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default KebijakanPrivasi;
