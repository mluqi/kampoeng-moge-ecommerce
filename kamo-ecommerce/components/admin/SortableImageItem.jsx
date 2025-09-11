"use client";
import React from "react";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiX } from "react-icons/fi";

export const SortableImageItem = ({ id, src, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    // This outer div is the sortable container.
    <div ref={setNodeRef} style={style} className="relative group">
      {/* This div is the handle for dragging */}
      <div
        {...attributes}
        {...listeners}
        className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 cursor-grab active:cursor-grabbing group-hover:border-accent transition-all duration-200 relative"
      >
        <Image src={src} alt="Preview" fill className="object-cover" />
        {/* Overlay for visual feedback during drag */}
        {transform && id === attributes["data-cypress-drag-handle"] && (
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        )}
      </div>

      {/* The delete button is a sibling to the draggable area, but positioned absolutely. */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 z-10 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all cursor-pointer"
        title="Hapus"
      >
        <FiX size={16} />
      </button>
    </div>
  );
};
