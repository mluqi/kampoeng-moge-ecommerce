"use client";
import React from "react";
import Image from "next/image";
import { assets } from "@/assets/assets";

const ConversationList = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
}) => {
  return (
    <div className="bg-gray-50 border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Percakapan</h2>
      </div>
      <ul className="divide-y divide-gray-200">
        {conversations.map((convo) => (
          <li
            key={convo.id}
            onClick={() => onSelectConversation(convo.id)}
            className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-100 transition-colors ${
              selectedConversationId === convo.id ? "bg-accent/10" : ""
            }`}
          >
            <Image
              src={convo.user?.user_photo || assets.user_icon}
              alt={convo.user?.user_name || "User"}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
            <div className="flex-grow overflow-hidden">
              <p className="font-semibold text-gray-800 truncate">
                {convo.user?.user_name || "Pengguna"}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {convo.messages?.[0]?.content || "Belum ada pesan."}
              </p>
            </div>
            <div className="flex flex-col items-end self-start space-y-1">
              <span className="text-xs text-gray-400">
                {new Date(convo.lastMessageAt).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {convo.unreadCount > 0 && (
                <span className="bg-accent text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {convo.unreadCount}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationList;
