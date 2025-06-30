/* eslint-disable react/no-unescaped-entities */
"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AboutUsPage = () => {
  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-14 md:pb-18">
        <div className="flex flex-col items-start">
          <div className="flex flex-col items-end pt-8 md:pt-12">
            <p className="text-2xl md:text-3xl font-medium">Tentang Kami</p>
            <div className="w-16 h-0.5 bg-accent rounded-full mt-1"></div>
          </div>
          <div className="mt-8 md:mt-12 text-gray-700 space-y-4">
            <p className="text-lg">Welcome to KAMO Ecommerce!</p>
            <p>
              At KAMO Ecommerce, we are passionate about bringing you the latest
              and greatest in technology and lifestyle products. Our mission is
              to provide a seamless and enjoyable shopping experience, offering
              a curated selection of high-quality items that cater to your needs
              and desires.
            </p>
            <p>
              Founded in [Year], KAMO Ecommerce started with a simple idea: to
              make top-tier products accessible to everyone, backed by excellent
              customer service. We believe in the power of technology to enhance
              lives and the joy of finding that perfect item that complements
              your lifestyle.
            </p>
            <p>
              Our team is dedicated to sourcing innovative products, ensuring
              they meet our standards of quality and reliability. We work
              closely with trusted brands and suppliers to bring you a diverse
              range of electronics, gadgets, accessories, and more.
            </p>
            <p>
              Customer satisfaction is at the heart of everything we do. We
              strive to provide prompt support, easy navigation, and a secure
              shopping environment. Whether you're looking for the newest
              smartphone, a powerful laptop, or stylish accessories, KAMO
              Ecommerce is your go-to destination.
            </p>
            <p>
              Thank you for choosing KAMO Ecommerce. We look forward to serving
              you!
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AboutUsPage;
