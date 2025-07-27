"use client";

import React, { useState, useEffect, useCallback } from "react";
import api from "@/service/api";
import Loading from "@/components/Loading";

const ProductTiktokSection = ({
  onAttributesChange,
  initialCategoryId,
  initialAttributes,
  initialKeyword,
}) => {
  // State untuk kategori
  const [tiktokCategories, setTiktokCategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [selectedTiktokCategory, setSelectedTiktokCategory] = useState("");

  // State untuk atribut
  const [tiktokAttributes, setTiktokAttributes] = useState([]);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);
  const [attributeValues, setAttributeValues] = useState({});

  // State untuk tracking initialization
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize component
  useEffect(() => {
    if (initialCategoryId && initialAttributes) {
      setIsEditMode(true);
      // Set search term to the initial keyword
      setCategorySearch(initialKeyword || "");
      // Set selected category
      setSelectedTiktokCategory(initialCategoryId);
      // Set initial attributes
      setAttributeValues(initialAttributes);
      setHasInitialized(true);
    } else {
      setIsEditMode(false);
      setHasInitialized(true);
    }
  }, [initialCategoryId, initialAttributes, initialKeyword]);

  // Fetch categories when search term changes (both create and edit modes)
  useEffect(() => {
    if (!hasInitialized) return;

    const handler = setTimeout(() => {
      if (categorySearch.length > 2) {
        fetchTiktokCategories(categorySearch);
      } else if (categorySearch.length === 0 && isEditMode) {
        // If search is cleared in edit mode, refetch with initial keyword
        setCategorySearch(initialKeyword || "");
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [categorySearch, hasInitialized, isEditMode, initialKeyword]);

  // Fetch categories from backend
  const fetchTiktokCategories = async (keyword) => {
    setIsLoadingCategories(true);
    try {
      const response = await api.get(
        `/products/tiktok/categories?keyword=${keyword}`
      );
      const categories = response.data || [];
      setTiktokCategories(categories);

      // In edit mode, try to find and select the initial category
      if (isEditMode && initialCategoryId) {
        const foundCategory = categories.find(
          (cat) => cat.id === initialCategoryId
        );
        if (foundCategory) {
          setSelectedTiktokCategory(foundCategory.id);
        } else {
          // If category not found in search results, fetch it directly
          fetchCategoryById(initialCategoryId);
        }
      }
    } catch (error) {
      console.error("Gagal memuat kategori TikTok", error);
      setTiktokCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Fetch single category by ID (fallback for edit mode)
  const fetchCategoryById = async (categoryId) => {
    try {
      const response = await api.get(
        `/products/tiktok/categories/${categoryId}/attributes`
      );
      const category = response.data;

      if (category) {
        // Add this category to the list
        setTiktokCategories([category]);
        setSelectedTiktokCategory(categoryId);
        // Update search term to match the category name
        setCategorySearch(category.local_name || category.name || "");
      }
    } catch (error) {
      console.error("Error fetching category by ID:", error);
    }
  };

  useEffect(() => {
    if (!selectedTiktokCategory) {
      setTiktokAttributes([]);
      if (!isEditMode) {
        setAttributeValues({});
      }
      return;
    }
  
    const fetchAttributes = async () => {
      setIsLoadingAttributes(true);
      try {
        const response = await api.get(
          `/products/tiktok/categories/${selectedTiktokCategory}/attributes`
        );
        const attributes = response.data || [];
        setTiktokAttributes(attributes);
  
        // --- Tambahkan merge logic di sini ---
        if (isEditMode && initialAttributes) {
          setAttributeValues(prev => {
            const merged = {};
            attributes.forEach(attr => {
              // Pastikan ID sama tipe data (string)
              const attrId = String(attr.id);
              merged[attrId] = initialAttributes[attrId] || { id: "", name: "" };
            });
            return merged;
          });
        } else if (!isEditMode) {
          setAttributeValues({});
        }
      } catch (error) {
        setTiktokAttributes([]);
      } finally {
        setIsLoadingAttributes(false);
      }
    };
  
    fetchAttributes();
  }, [selectedTiktokCategory, isEditMode, initialAttributes]);

  // Handle category selection
  const handleCategoryChange = (newCategoryId) => {
    setSelectedTiktokCategory(newCategoryId);

    // Reset attributes if not in edit mode or if category changed
    if (!isEditMode || newCategoryId !== initialCategoryId) {
      setAttributeValues({});
    }
  };

  // Handle search input changes
  const handleCategorySearchChange = (value) => {
    setCategorySearch(value);

    // Reset categories if search term is too short
    if (value.length <= 2) {
      setTiktokCategories([]);
      if (!isEditMode) {
        setSelectedTiktokCategory("");
      }
    }
  };

  // Handle attribute changes
  const handleAttributeChange = (attributeId, valueId, valueName) => {
    setAttributeValues((prev) => ({
      ...prev,
      [attributeId]: { id: valueId, name: valueName },
    }));
  };

  // Notify parent component of changes
  useEffect(() => {
    if (hasInitialized) {
      const currentKeyword = isEditMode ? initialKeyword : categorySearch;
      onAttributesChange(
        attributeValues,
        selectedTiktokCategory,
        currentKeyword
      );
    }
  }, [
    attributeValues,
    selectedTiktokCategory,
    onAttributesChange,
    hasInitialized,
    categorySearch,
    initialKeyword,
    isEditMode,
  ]);

  // Render attribute input based on type
  const renderAttributeInput = (attribute) => {
    const currentValue = attributeValues[attribute.id];

    if (attribute.values && attribute.values.length > 0) {
      return (
        <div key={attribute.id} className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            {attribute.name}{" "}
            {attribute.is_mandatory && <span className="text-red-500">*</span>}
          </label>
          <select
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white"
            onChange={(e) => {
              const selectedOption = e.target.options[e.target.selectedIndex];
              const selectedText =
                selectedOption.text !== `Pilih ${attribute.name}`
                  ? selectedOption.text
                  : "";

              handleAttributeChange(attribute.id, e.target.value, selectedText);
            }}
            value={currentValue?.id || ""}
            required={attribute.is_mandatory}
          >
            <option value="">Pilih {attribute.name}</option>
            {attribute.values.map((val) => (
              <option key={val.id} value={val.id}>
                {val.name}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div key={attribute.id} className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          {attribute.name}{" "}
          {attribute.is_mandatory && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          onChange={(e) =>
            handleAttributeChange(attribute.id, null, e.target.value)
          }
          value={currentValue?.name || ""}
          required={attribute.is_mandatory}
          placeholder={"Masukkan " + attribute.name}
        />
      </div>
    );
  };

  if (!hasInitialized) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Spesifikasi TikTok Shop
      </h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Kategori TikTok
        </label>
        <input
          type="text"
          placeholder="Cari kategori (misal: Sepeda Motor)"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          value={categorySearch}
          onChange={(e) => handleCategorySearchChange(e.target.value)}
        />

        {isLoadingCategories && (
          <p className="text-sm text-gray-500 mt-1">Mencari...</p>
        )}

        {tiktokCategories.length > 0 && (
          <select
            className="mt-2 block w-full p-2 border border-gray-300 rounded-md bg-white"
            value={selectedTiktokCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="">Pilih Kategori</option>
            {tiktokCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.local_name || cat.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {isLoadingAttributes && <Loading />}

      {tiktokAttributes.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium text-gray-700 mb-3">
            Atribut Produk ({tiktokAttributes.length})
          </h4>
          {tiktokAttributes.map(renderAttributeInput)}
        </div>
      )}
    </div>
  );
};

export default ProductTiktokSection;
