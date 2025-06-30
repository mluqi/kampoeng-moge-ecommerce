"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useProduct } from "@/contexts/ProductContext";
import { useCategory } from "@/contexts/CategoryContext";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { assets } from "@/assets/assets";
import { FiUpload, FiX, FiChevronDown } from "react-icons/fi";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const ProductDetailEdit = () => {
  const { fetchProductById, updateProduct } = useProduct();
  const { categories, fetchCategories } = useCategory();
  const params = useParams();
  const { id } = params;
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    sku: "",
    price: "",
    stock: "",
    condition: "Baru",
    status: "active",
    category: "",
    weight: "",
    dimension: "",
    annotations: "",
  });
  const [msg, setMsg] = useState("");
  const [pictures, setPictures] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  // Parse dimension into separate fields for better UX
  const [dimensionValues, setDimensionValues] = useState({
    length: "",
    width: "",
    height: "",
  });

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadProduct = async () => {
      const fetched = await fetchProductById(id);
      if (isMounted && fetched) {
        setProduct(fetched);
        setPictures(
          Array.isArray(fetched.product_pictures)
            ? fetched.product_pictures
            : []
        );

        // Parse dimension if it exists
        let dimensionData = { length: "", width: "", height: "" };
        if (fetched.product_dimensions) {
          try {
            const parsed =
              typeof fetched.product_dimensions === "string"
                ? JSON.parse(fetched.product_dimensions)
                : fetched.product_dimensions;
            dimensionData = {
              length: parsed.length || "",
              width: parsed.width || "",
              height: parsed.height || "",
            };
          } catch (e) {
            console.error("Error parsing dimensions:", e);
          }
        }

        setDimensionValues(dimensionData);
        setForm({
          name: fetched.product_name || "",
          description: fetched.product_description || "",
          sku: fetched.product_sku || "",
          price: fetched.product_price || "",
          stock: fetched.product_stock || "",
          condition: fetched.product_condition || "Baru",
          status: fetched.product_status || "active",
          category: fetched.product_category || "",
          weight: fetched.product_weight || "",
          dimension: fetched.product_dimensions || "",
          annotations: fetched.product_annotations || "",
        });
        setLoading(false);
      }
    };

    loadProduct();
    if (!categories.length) fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [id, categories.length]);

  // Handle file input (multiple)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Validasi file (opsional)
    const validFiles = files.filter((file) => {
      return file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024; // Max 5MB
    });

    setNewFiles((prev) => [...prev, ...validFiles]);
  };

  // Fungsi untuk menghapus gambar baru yang dipilih
  const removeNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Fungsi untuk menghapus gambar yang sudah ada
  const removeExistingImage = (index) => {
    setPictures((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDimensionChange = (e) => {
    const { name, value } = e.target;
    setDimensionValues((prev) => {
      const newDims = { ...prev, [name]: value };
      setForm((prevForm) => ({
        ...prevForm,
        dimension: JSON.stringify(newDims),
      }));
      return newDims;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg("");

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("sku", form.sku);
    formData.append("price", form.price);
    formData.append("stock", form.stock);
    formData.append("condition", form.condition);
    formData.append("status", form.status);
    formData.append("category", form.category);
    formData.append("weight", form.weight);
    formData.append("dimension", form.dimension);
    formData.append("annotations", form.annotations);

    newFiles.forEach((file) => {
      formData.append("pictures", file);
    });

    try {
      const success = await updateProduct(id, formData);
      setMsg(success ? "Produk berhasil diupdate" : "Gagal update produk");
      if (success) {
        setEditMode(false);
        setNewFiles([]);
        const refreshed = await fetchProductById(id);
        setProduct(refreshed);
        setPictures(
          Array.isArray(refreshed.product_pictures)
            ? refreshed.product_pictures
            : []
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        <div className="flex gap-6">
          <div className="w-1/3 space-y-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
          <div className="w-2/3 space-y-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-4 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );

  if (!product)
    return <div className="p-8 text-red-500">Product not found.</div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {!editMode ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <button
              type="button"
              onClick={() => {
                router.push("/admin/product-list");
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back to List
            </button>
          </div>
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold">{product.product_name}</h1>
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Edit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="font-medium block mb-2">Product Images</label>
              <div className="flex flex-wrap gap-3">
                {pictures.length > 0 ? (
                  pictures.map((pic, idx) => (
                    <div key={idx} className="relative">
                      <Image
                        src={pic.startsWith("http") ? pic : baseUrl + pic}
                        alt={`product-img-${idx}`}
                        width={120}
                        height={120}
                        className="rounded-lg border object-cover w-28 h-28"
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400">No images available</div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">SKU</p>
                  <p className="font-medium">{product.product_sku || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">
                    {product.category?.category_name ||
                      categories.find(
                        (c) => c.category_id === product.product_category
                      )?.category_name ||
                      "-"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium">
                    Rp {(product.product_price || 0).toLocaleString("id-ID")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stock</p>
                  <p className="font-medium">{product.product_stock}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Condition</p>
                  <p className="font-medium">{product.product_condition}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium capitalize">
                    {product.product_status}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Weight</p>
                  <p className="font-medium">{product.product_weight} kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dimensions</p>
                  <p className="font-medium">
                    {typeof product.product_dimensions === "string"
                      ? product.product_dimensions
                      : JSON.stringify(product.product_dimensions)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <div className="bg-gray-50 border rounded-lg p-4">
              {product.product_description || "No description available"}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Annotations</h3>
            <div className="bg-gray-50 border rounded-lg p-4">
              {product.product_annotations || "No annotations"}
            </div>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Edit Product</h1>
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                setMsg("");
                setNewFiles([]);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back to view
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Product Name*
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description*
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Product Images
                </label>

                {/* Current Images with Remove Option */}
                {pictures.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Current Images:
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {pictures.map((pic, idx) => (
                        <div key={idx} className="relative group">
                          <Image
                            src={pic.startsWith("http") ? pic : baseUrl + pic}
                            alt={`product-${idx}`}
                            width={100}
                            height={100}
                            className="rounded-lg object-cover w-24 h-24 border"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Upload Area */}
                <label className="block text-sm font-medium mb-1">
                  Add New Images (Max 5MB each)
                </label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-400">PNG, JPG (Max 5MB)</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>

                {/* New Image Previews */}
                {newFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      {newFiles.length} new image(s) selected:
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {newFiles.map((file, idx) => (
                        <div key={idx} className="relative group">
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={`new-upload-${idx}`}
                            width={100}
                            height={100}
                            className="rounded-lg object-cover w-24 h-24 border"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewFile(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">SKU*</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Price*
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2">Rp</span>
                    <input
                      type="number"
                      className="w-full pl-8 pr-3 py-2 border rounded-lg"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Stock*
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Weight (kg)*
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={form.weight}
                    onChange={(e) =>
                      setForm({ ...form, weight: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Dimensions (cm)*
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    name="length"
                    placeholder="Length"
                    className="px-3 py-2 border rounded-lg"
                    value={dimensionValues.length}
                    onChange={handleDimensionChange}
                  />
                  <input
                    type="number"
                    name="width"
                    placeholder="Width"
                    className="px-3 py-2 border rounded-lg"
                    value={dimensionValues.width}
                    onChange={handleDimensionChange}
                  />
                  <input
                    type="number"
                    name="height"
                    placeholder="Height"
                    className="px-3 py-2 border rounded-lg"
                    value={dimensionValues.height}
                    onChange={handleDimensionChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Category*
                </label>
                <div className="relative">
                  <select
                    className="w-full px-3 py-2 border rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 pr-8"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3 top-3 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Condition*
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={form.condition}
                    onChange={(e) =>
                      setForm({ ...form, condition: e.target.value })
                    }
                    required
                  >
                    <option value="Baru">New</option>
                    <option value="Bekas">Used</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status*
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Annotations
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg"
                  value={form.annotations}
                  onChange={(e) =>
                    setForm({ ...form, annotations: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t">
            <div>
              {msg && (
                <div
                  className={`px-4 py-2 rounded ${
                    msg.includes("berhasil")
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {msg}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditMode(false);
                  setMsg("");
                  setNewFiles([]);
                }}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProductDetailEdit;
