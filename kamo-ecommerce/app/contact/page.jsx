/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/service/api";
import Loading from "@/components/Loading";

const ContactPage = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await api.get("/content/contact_us");
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
      <div className="px-6 md:px-16 lg:px-32 pt-14 md:pb-12">
        <div className="flex flex-col items-start">
          <div className="flex flex-col items-end pt-8 md:pt-12">
            <p className="text-2xl md:text-3xl font-medium">
              {loading ? "Memuat..." : content?.content_title || "Kontak Kami"}
            </p>
            <div className="w-16 h-0.5 bg-accent rounded-full mt-1"></div>
          </div>

          {/* Konten dan Maps */}
          <div className="mt-8 md:mt-12 flex flex-col lg:flex-row gap-8 w-full">
            {/* Konten teks */}
            {loading ? (
              <div className="w-full lg:w-1/2"><Loading /></div>
            ) : (
              <div
                className="text-gray-700 space-y-6 w-full lg:w-1/2 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: content?.content_value || "<p>Konten tidak tersedia.</p>" }}
              />
            )}

            {/* Google Maps */}
            <div className="w-full lg:w-1/2">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.5533538637856!2d108.5160806!3d-6.702104299999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6ee21eb90941f1%3A0x6b79901845f38038!2sKampoeng%20moge!5e0!3m2!1sen!2sid!4v1750736235458!5m2!1sen!2sid"
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-xl shadow"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContactPage;
