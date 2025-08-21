import React, { useState } from "react";

const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "highest-price", label: "Harga Tertinggi" },
  { value: "lowest-price", label: "Harga Terendah" },
  { value: "most-sold", label: "Produk Terjual" },
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
    <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
      {/* Category Selection */}
      <div className="relative w-full md:w-auto">
        <div className="flex flex-wrap gap-2">
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
            Semua Kategori
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
      <div className="relative min-w-[200px]">
        <select
          value={selectedSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full cursor-pointer appearance-none rounded border border-gray-200 bg-white px-4 py-2 pr-10 text-accent transition-all hover:bg-gray-50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="h-5 w-5 text-gray-400"
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
        </div>
      </div>
    </div>
  );
}
