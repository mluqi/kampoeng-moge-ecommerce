"use client";
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useProduct } from "@/contexts/ProductContext";
import api from "@/service/api";
import { useCategory } from "@/contexts/CategoryContext";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { assets } from "@/assets/assets";
import { FiX, FiChevronDown, FiArrowLeft } from "react-icons/fi";
import toast from "react-hot-toast";
import ProductTiktokSection from "@/components/admin/ProductTiktokSection";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { SortableImageItem } from "@/components/admin/SortableImageItem";

// Import ReactQuill secara dinamis untuk menghindari masalah SSR
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <p className="text-gray-500">Memuat editor...</p>,
});

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const ProductDetailEdit = () => {
  // Preserved all context hooks and state management
  const { fetchProductById, updateProduct } = useProduct();
  const { categories, fetchCategories } = useCategory();
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const fileInputRef = useRef(null);

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
    product_price_tiktok: "",
    stock: "",
    condition: "Baru",
    status: "active",
    category: "",
    weight: "",
    dimension: "",
    annotations: "",
    brand: "",
  });

  // State for sortable images
  const [imageItems, setImageItems] = useState([]);
  const [activeId, setActiveId] = useState(null);

  // Parse dimension into separate fields for better UX
  const [dimensionValues, setDimensionValues] = useState({
    length: "",
    width: "",
    height: "",
  });

  // State untuk integrasi TikTok
  const [categoryKeyword, setCategoryKeyword] = useState("");
  const [tiktokCategoryId, setTiktokCategoryId] = useState("");
  const [tiktokProductAttributes, setTiktokProductAttributes] = useState([]);
  const [initialTiktokAttributes, setInitialTiktokAttributes] = useState({});

  // Format harga dengan titik ribuan saat input, tapi kirim ke backend tetap angka
  const formatNumber = (value) => {
    const numericValue = String(value).replace(/\D/g, "");
    if (!numericValue) return "";
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Handler khusus untuk input harga agar selalu terformat
  const handlePriceChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setForm((prev) => ({
      ...prev,
      price: formatNumber(raw),
    }));
  };

  const handleTiktokPriceChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setForm((prev) => ({
      ...prev,
      product_price_tiktok: formatNumber(raw),
    }));
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadProduct = async () => {
      // Panggil API secara langsung dengan parameter 'from=admin'
      // untuk memastikan produk non-aktif tetap bisa diakses di halaman ini.
      const response = await api.get(`/products/${id}`, {
        params: { from: "admin" },
      });
      const fetched = response.data;
      if (isMounted && fetched) {
        setProduct(fetched);

        // Initialize sortable image items
        const initialImages = (fetched.product_pictures || []).map((url) => ({
          id: url, // Use URL as a unique ID for existing images
          type: "existing",
          payload: url, // The URL string
        }));
        setImageItems(initialImages);

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

        // Set data awal TikTok jika ada
        if (fetched.product_categories_tiktok) {
          setTiktokCategoryId(fetched.product_categories_tiktok);
        }
        if (fetched.product_attributes_tiktok) {
          try {
            const parsedAttributes = fetched.product_attributes_tiktok;
            const initialAttrs = parsedAttributes.reduce((acc, attr) => {
              const firstValue = attr.values?.[0];
              if (firstValue) {
                acc[attr.id] = {
                  id: firstValue.id,
                  name: firstValue.name,
                };
              }
              return acc;
            }, {});

            setInitialTiktokAttributes(initialAttrs);
          } catch (e) {
            console.error("Gagal mem-parsing atribut TikTok:", e);
          }
        }

        setDimensionValues(dimensionData);
        setForm({
          name: fetched.product_name || "",
          description: fetched.product_description || "",
          sku: fetched.product_sku || "",
          price: formatNumber(fetched.product_price),
          product_price_tiktok: formatNumber(
            fetched.product_price_tiktok || ""
          ),
          stock: fetched.product_stock || "",
          condition: fetched.product_condition || "Baru",
          status: fetched.product_status || "active",
          category: fetched.product_category || "",
          weight: fetched.product_weight || "",
          dimension: JSON.stringify(dimensionData),
          annotations: fetched.product_annotations || "",
          brand: fetched.product_brand || "",
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

  // Callback untuk menerima data dari ProductTiktokSection
  const handleTiktokDataChange = useCallback(
    (attributeValues, categoryId, keyword) => {
      setTiktokCategoryId(categoryId);
      setCategoryKeyword(keyword);

      // Format atribut untuk payload API
      const formattedAttributes = Object.entries(attributeValues)
        .filter(([, value]) => value && value.name)
        .map(([attrId, value]) => {
          const attributeValue = { name: value.name };
          if (value.id) {
            attributeValue.id = value.id;
          }
          return {
            id: attrId,
            values: [attributeValue],
          };
        });
      setTiktokProductAttributes(formattedAttributes);
    },
    []
  );

  const refreshProductData = useCallback(async () => {
    const toastId = toast.loading("Memuat ulang data produk...");
    const refreshed = await fetchProductById(id);
    if (refreshed) {
      setProduct(refreshed);
      toast.success("Data produk berhasil dimuat ulang", { id: toastId });
    } else {
      toast.error("Gagal memuat ulang data produk", { id: toastId });
    }
  }, [id, fetchProductById]);

  // Konfigurasi ReactQuill
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["clean"],
        ],
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "link",
    "image",
  ];

  // Handle file input (multiple)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots =
      9 - (existingPictures.length - markedForRemoval.length + newFiles.length);

    if (files.length > remainingSlots) {
      toast.error(`Anda hanya dapat menambahkan ${remainingSlots} gambar lagi`);
      return;
    }

    const validFiles = files.filter((file) => {
      return file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024; // Max 5MB
    });

    setNewFiles((prev) => [...prev, ...validFiles]);
  };

  // Remove new file that hasn't been uploaded yet
  const removeNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Mark existing image for removal (won't actually remove until saved)
  const toggleMarkForRemoval = (index) => {
    setMarkedForRemoval((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
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

  // --- DND Kit Handlers ---
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setImageItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  const handleFileSelect = (selectedFiles) => {
    const validFiles = Array.from(selectedFiles).filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024
    );

    if (validFiles.length !== selectedFiles.length) {
      toast.error(
        "Beberapa file tidak valid (melebihi 5MB atau bukan gambar)."
      );
    }

    const newImageItems = validFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}`,
      type: "new",
      payload: file,
    }));

    setImageItems((prev) => [...prev, ...newImageItems].slice(0, 9));
  };

  const handleRemoveImage = (idToRemove) => {
    setImageItems((prev) => prev.filter((item) => item.id !== idToRemove));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const cleanedDescription = form.description.replace(/<p><br><\/p>/g, "<br>");

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", cleanedDescription);
    formData.append("sku", form.sku);
    formData.append("price", form.price.replace(/\./g, ""));
    formData.append(
      "product_price_tiktok",
      form.product_price_tiktok.replace(/\./g, "")
    );
    formData.append("stock", form.stock);
    formData.append("condition", form.condition);
    formData.append("status", form.status);
    formData.append("category", form.category);
    formData.append("weight", form.weight);
    formData.append("dimension", form.dimension);
    formData.append("annotations", form.annotations);
    formData.append("brand", form.brand);

    // Tambahkan data TikTok ke FormData
    if (categoryKeyword) {
      formData.append("categoryKeyword", categoryKeyword);
    }
    if (tiktokCategoryId) {
      formData.append("tiktokCategoryId", tiktokCategoryId);
      formData.append(
        "tiktokProductAttributes",
        JSON.stringify(tiktokProductAttributes)
      );
    }

    // Process sorted images
    imageItems.forEach((item) => {
      if (item.type === "existing") {
        formData.append("existingPictures[]", item.payload);
      } else {
        formData.append("pictures", item.payload);
      }
    });

    try {
      const success = await updateProduct(id, formData);
      if (success) {
        toast.success("Produk berhasil diperbarui");
        setEditMode(false);
        // refresh data
        const refreshed = await fetchProductById(id);
        setProduct(refreshed);
        // Re-initialize image items from the newly saved data
        setImageItems(
          (refreshed.product_pictures || []).map((url) => ({
            id: url,
            type: "existing",
            payload: url,
          }))
        );
      } else {
        toast.error("Gagal memperbarui produk");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat memperbarui produk");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        <div className="flex gap-6">
          <div className="w-1/3 space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="w-2/3 space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 text-red-500 flex flex-col items-center justify-center h-64">
        <p>Produk tidak ditemukan</p>
        <button
          onClick={() => router.push("/admin/product-list")}
          className="mt-4 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center gap-2 cursor-pointer"
        >
          <FiArrowLeft /> Kembali ke Daftar Produk
        </button>
      </div>
    );
  }

  const canAddMoreImages = imageItems.length < 9;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-8xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
        {!editMode ? (
          <>
            <div className="p-6 border-b">
              <button
                type="button"
                onClick={() => router.push("/admin/product-list")}
                className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
              >
                <FiArrowLeft /> Kembali ke Daftar Produk
              </button>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {product?.product_name}
                  </h1>
                  <p className="text-gray-500 mt-1">
                    {product.product_sku || "No SKU"}
                  </p>
                </div>
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                >
                  Edit Produk
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-700">
                    Gambar Produk
                  </h2>
                  {imageItems.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {imageItems.map((item, idx) => (
                        <div key={idx} className="relative aspect-square">
                          <Image
                            src={baseUrl + item.payload}
                            alt={`product-${idx}`}
                            fill
                            className="rounded-lg object-cover border"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center text-gray-400">
                      Tidak ada gambar produk
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-5">
                    <h3 className="font-medium text-gray-700 mb-3">
                      Informasi Produk
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Merek</p>
                        <p className="font-medium">
                          {product.product_brand || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Kategori</p>
                        <p className="font-medium">
                          {product.category?.category_name ||
                            categories.find(
                              (c) => c.category_id === product.product_category
                            )?.category_name ||
                            "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Harga</p>
                        <p className="font-medium">
                          Rp{" "}
                          {(product.product_price || 0).toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Harga TikTok</p>
                        <p className="font-medium">
                          Rp{" "}
                          {(product.product_price_tiktok || 0).toLocaleString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Stok</p>
                        <p className="font-medium">{product.product_stock}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Kondisi</p>
                        <p className="font-medium">
                          {product.product_condition}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p
                          className={`font-medium capitalize ${
                            product.product_status === "active"
                              ? "text-green-600"
                              : "text-gray-600"
                          }`}
                        >
                          {product.product_status}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-5">
                    <h3 className="font-medium text-gray-700 mb-3">
                      Spesifikasi
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Berat</p>
                        <p className="font-medium">
                          {product.product_weight || "0"} kg
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Dimensi</p>
                        <p className="font-medium">
                          {dimensionValues.length
                            ? `${dimensionValues.length} x ${dimensionValues.width} x ${dimensionValues.height} cm`
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* --- Bagian Integrasi TikTok --- */}
                  {/* {product.product_tiktok_id && (
                    <div className="bg-gray-50 rounded-lg p-5">
                      <h3 className="font-medium text-gray-700 mb-3">
                        Integrasi TikTok Shop
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Status TikTok</p>
                          <div className="mt-1">
                            <TiktokStatusBadge status={product.tiktok_status} />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Aksi TikTok</p>
                          <div className="mt-1">
                            <ProductTiktokActions
                              product={product}
                              onActionComplete={refreshProductData}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )} */}

                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">
                      Deskripsi
                    </h3>
                    <div
                      className="prose max-w-none text-gray-600"
                      dangerouslySetInnerHTML={{
                        __html:
                          product.product_description ||
                          "<p>Tidak ada deskripsi</p>",
                      }}
                    ></div>
                  </div>

                  {product.product_annotations && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">
                        Catatan Tambahan
                      </h3>
                      <div className="prose max-w-none text-gray-600">
                        {product.product_annotations}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="divide-y">
            {/* Header */}
            <div className="p-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Edit Produk
                </h1>
                <p className="text-gray-500">ID: {id}</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setNewFiles([]);
                    setMarkedForRemoval([]);
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-lg text-white ${
                    isSubmitting
                      ? "bg-accent/70 cursor-not-allowed"
                      : "bg-accent hover:bg-accent/90"
                  }`}
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Image Management */}
                <div>
                  <h2 className="text-lg font-medium text-gray-700 mb-3">
                    Gambar Produk (Maks. 9, bisa diurutkan)
                  </h2>
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg"
                  >
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={imageItems.map((item) => item.id)}
                      >
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                          {imageItems.map((item) => (
                            <SortableImageItem
                              key={item.id}
                              id={item.id}
                              src={
                                item.type === "new"
                                  ? URL.createObjectURL(item.payload)
                                  : baseUrl + item.payload
                              }
                              onRemove={() => handleRemoveImage(item.id)}
                            />
                          ))}
                          {canAddMoreImages && (
                            <div
                              onClick={() => fileInputRef.current.click()}
                              className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-accent transition-colors text-gray-500 hover:text-accent"
                            >
                              <Image
                                src={assets.upload_area}
                                alt="Upload"
                                width={40}
                                height={40}
                                className="opacity-60"
                              />
                              <p className="text-xs mt-2">Tambah Gambar</p>
                            </div>
                          )}
                        </div>
                      </SortableContext>
                    </DndContext>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => handleFileSelect(e.target.files)}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Basic Info */}
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-700">
                    Informasi Dasar
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Produk*
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deskripsi*
                      </label>
                      <div className="relative border border-gray-300 rounded-md overflow-hidden bg-white focus-within:ring-1 focus-within:ring-accent focus-within:border-accent">
                        <ReactQuill
                          theme="snow"
                          value={form.description}
                          onChange={(value) =>
                            setForm({ ...form, description: value })
                          }
                          modules={modules}
                          formats={formats}
                          placeholder="Deskripsi lengkap produk..."
                          className="[&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-toolbar]:bg-gray-50 [&_.ql-container]:border-0 [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:max-h-[400px] [&_.ql-editor]:overflow-y-auto [&_.ql-editor]:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 mt-12">
                        Catatan Tambahan
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                        value={form.annotations}
                        onChange={(e) =>
                          setForm({ ...form, annotations: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Inventory */}
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-700">
                    Persediaan & Harga
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SKU*
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                        value={form.sku}
                        onChange={(e) =>
                          setForm({ ...form, sku: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Harga (Rp)*
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">Rp</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                          value={form.price}
                          onChange={handlePriceChange}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Harga TikTok (Rp)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">Rp</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                          value={form.product_price_tiktok}
                          onChange={handleTiktokPriceChange}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Kosongkan jika sama dengan harga website.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stok*
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                        value={form.stock}
                        onChange={(e) =>
                          setForm({ ...form, stock: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategori*
                      </label>
                      <div className="relative">
                        <select
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-accent focus:border-accent pr-8"
                          value={form.category}
                          onChange={(e) =>
                            setForm({ ...form, category: e.target.value })
                          }
                          required
                        >
                          <option value="">Pilih Kategori</option>
                          {categories.map((cat) => (
                            <option
                              key={cat.category_id}
                              value={cat.category_id}
                            >
                              {cat.category_name}
                            </option>
                          ))}
                        </select>
                        <FiChevronDown className="absolute right-3 top-3 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping */}
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-700">
                    Pengiriman
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Berat (kg)*
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent pr-12"
                          value={form.weight}
                          onChange={(e) =>
                            setForm({ ...form, weight: e.target.value })
                          }
                          required
                        />
                        <span className="absolute right-3 top-2.5 text-gray-500">
                          kg
                        </span>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dimensi (cm)*
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Panjang
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="length"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent pr-12"
                              value={dimensionValues.length}
                              onChange={handleDimensionChange}
                              required
                            />
                            <span className="absolute right-3 top-2.5 text-gray-500">
                              cm
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Lebar
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="width"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent pr-12"
                              value={dimensionValues.width}
                              onChange={handleDimensionChange}
                              required
                            />
                            <span className="absolute right-3 top-2.5 text-gray-500">
                              cm
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Tinggi
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="height"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent pr-12"
                              value={dimensionValues.height}
                              onChange={handleDimensionChange}
                              required
                            />
                            <span className="absolute right-3 top-2.5 text-gray-500">
                              cm
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-700">
                    Informasi Tambahan
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Merek
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                        value={form.brand}
                        onChange={(e) =>
                          setForm({ ...form, brand: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kondisi*
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                        value={form.condition}
                        onChange={(e) =>
                          setForm({ ...form, condition: e.target.value })
                        }
                        required
                      >
                        <option value="Baru">Baru</option>
                        <option value="Bekas">Bekas</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status*
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                        value={form.status}
                        onChange={(e) =>
                          setForm({ ...form, status: e.target.value })
                        }
                        required
                      >
                        <option value="active">Aktif</option>
                        <option value="inactive">Nonaktif</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* --- Bagian Integrasi TikTok Shop --- */}
                <div className="pt-6 border-t">
                  <h2 className="text-lg font-semibold mb-4 text-gray-700">
                    Integrasi TikTok Shop
                  </h2>
                  <ProductTiktokSection
                    onAttributesChange={handleTiktokDataChange}
                    initialCategoryId={product.product_categories_tiktok}
                    initialAttributes={initialTiktokAttributes}
                    initialKeyword={product.product_keywords_search}
                  />
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductDetailEdit;
