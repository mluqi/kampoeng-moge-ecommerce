import React, { useState } from "react";

const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "highest-price", label: "Harga Tertinggi" },
  { value: "lowest-price", label: "Harga Terendah" },
  { value: "most-sold", label: "Terjual Terbanyak" },
];

export default function ProductFilterBar({
  categories = [],
  selectedCategory,
  onCategoryChange,
  selectedSort,
  onSortChange,
}) {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter categories based on search term
  const filteredCategories = categories.filter((cat) =>
    cat.category_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle category dropdown
  const toggleCategoryDropdown = () => {
    setShowCategoryDropdown(!showCategoryDropdown);
    if (showCategoryDropdown) {
      setSearchTerm("");
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    onCategoryChange(categoryId);
    setShowCategoryDropdown(false);
    setSearchTerm("");
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Category Selection */}
      <div className="relative">
        <div className="flex flex-wrap gap-2 mb-2">
          {/* All Collections button */}
          <button
            onClick={() => onCategoryChange("")}
            className={`px-4 py-2 rounded border transition-all whitespace-nowrap
              ${
                selectedCategory === ""
                  ? "bg-accent text-white border-accent"
                  : "bg-white text-accent border-gray-200 hover:bg-gray-50"
              }`}
          >
            All Collections
          </button>

          {/* Show first 3 categories as buttons */}
          {categories.slice(0, 0).map((cat) => (
            <button
              key={cat.category_id}
              onClick={() => onCategoryChange(cat.category_id)}
              className={`px-4 py-2 rounded border transition-all whitespace-nowrap
                ${
                  selectedCategory === cat.category_id
                    ? "bg-accent text-white border-accent"
                    : "bg-white text-accent border-gray-200 hover:bg-gray-50"
                }`}
            >
              {cat.category_name}
            </button>
          ))}

          {/* Dropdown toggle for remaining categories */}
          {categories.length > 3 && (
            <button
              onClick={toggleCategoryDropdown}
              className="px-4 py-2 rounded border border-gray-200 bg-white text-accent 
                         hover:bg-gray-50 transition-all flex items-center gap-1"
            >
              <span>Kategori</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  showCategoryDropdown ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        {showCategoryDropdown && (
          <div className="absolute z-10 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200">
            {/* Search input */}
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                placeholder="Cari kategori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md 
                           focus:outline-none focus:ring-1 focus:ring-gray-400"
                autoFocus
              />
            </div>

            {/* Category list */}
            <div className="max-h-60 overflow-y-auto">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <button
                    key={cat.category_id}
                    onClick={() => handleCategorySelect(cat.category_id)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 
                               transition-colors ${
                                 selectedCategory === cat.category_id
                                   ? "bg-accent/10 text-accent font-medium"
                                   : "text-gray-700"
                               }`}
                  >
                    {cat.category_name}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">
                  Kategori tidak ditemukan
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sort Dropdown */}
      <div className="flex gap-3 p-2 bg-gray-50 rounded-lg max-w-fit">
        <select
          value={selectedSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 bg-white text-gray-800 
                    text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 cursor-pointer min-w-[150px]"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}