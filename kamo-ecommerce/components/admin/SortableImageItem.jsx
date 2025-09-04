"use client";
import React from "react";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiX, FiMove } from "react-icons/fi";

export const SortableImageItem = ({ id, src, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group"
    >
      <Image
        src={src}
        alt="Preview"
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-white cursor-grab active:cursor-grabbing"
          title="Urutkan"
        >
          <FiMove size={20} />
        </button>{" "}
        <button
          type="button"
          onClick={onRemove}
          className="text-white hover:text-red-500"
          title="Hapus"
        >
          <FiX size={20} />
        </button>
      </div>
    </div>
  );
};
