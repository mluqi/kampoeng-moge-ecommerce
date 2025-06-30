import React from "react";
import { FaInstagram } from "react-icons/fa6";

const NewsLetter = () => {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-14 space-y-6">
      <div className="flex flex-col items-center">
        <p className="text-3xl font-medium">Cek Instagram Kami</p>
        <div className="w-28 h-0.5 bg-accent mt-2"></div>
      </div>
      <iframe
        src="https://www.instagram.com/p/C_PWOHypuPz/embed"
        width="400"
        height="500"
        className="rounded-md border"
        allowTransparency={true}
        frameBorder="0"
        scrolling="no"
        title="Instagram"
      />
    </div>
  );
};

export default NewsLetter;
