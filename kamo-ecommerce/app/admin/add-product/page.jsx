"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useProduct } from "@/contexts/ProductContext";
import { useCategory } from "@/contexts/CategoryContext";
import toast from "react-hot-toast";
import ProductTiktokSection from "@/components/admin/ProductTiktokSection"; // 1. Impor komponen TikTok
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css"; // Import CSS untuk editor

// Import ReactQuill secara dinamis untuk menghindari masalah SSR
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <p className="text-gray-500">Memuat editor...</p>,
});

const AddProduct = () => {
  // Preserved all context hooks and state management
  const { addProduct } = useProduct();
  const { categories, fetchCategories } = useCategory();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [condition, setCondition] = useState("Baru");
  const [status, setStatus] = useState("active");
  const [category, setCategory] = useState("");
  const [weight, setWeight] = useState("");
  const [dimensions, setDimensions] = useState({
    length: "",
    width: "",
    height: "",
  });
  const [annotations, setAnnotations] = useState("");
  const [brand, setBrand] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Tambahkan state untuk menampung data spesifik dari TikTok
  const [categoryKeyword, setCategoryKeyword] = useState("");
  const [tiktokCategoryId, setTiktokCategoryId] = useState("");
  const [tiktokProductAttributes, setTiktokProductAttributes] = useState([]);
  const [descriptionLength, setDescriptionLength] = useState(0);

  // 3. Buat callback untuk menerima data dari komponen ProductTiktokSection
  const handleTiktokDataChange = useCallback((attributeValues, categoryId, keyword) => {
    setTiktokCategoryId(categoryId);
    setCategoryKeyword(keyword);

    // Format data agar sesuai dengan struktur payload API TikTok
    const formattedAttributes = Object.entries(attributeValues)
      .filter(([, value]) => value && value.name) // Filter atribut yang punya value
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
  }, []);

  // Konfigurasi modul untuk toolbar ReactQuill
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

  // Preserved the handleSubmit function with added loading state
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // --- START: Frontend Validation ---
    if (name.length < 25 || name.length > 255) {
      toast.error("Judul produk harus antara 25 dan 255 karakter.");
      setIsSubmitting(false);
      return;
    }

    const plainTextDescription = description.replace(/<[^>]*>?/gm, "").trim();
    if (
      plainTextDescription.length < 60 ||
      plainTextDescription.length > 10000
    ) {
      toast.error("Deskripsi produk harus antara 60 dan 10.000 karakter.");
      setIsSubmitting(false);
      return;
    }

    const { length, width, height } = dimensions;
    const weightKg = parseFloat(weight);

    if (
      !length ||
      !width ||
      !height ||
      parseFloat(length) <= 0 ||
      parseFloat(length) > 60 ||
      parseFloat(width) <= 0 ||
      parseFloat(width) > 60 ||
      parseFloat(height) <= 0 ||
      parseFloat(height) > 60
    ) {
      toast.error(
        "Setiap dimensi (panjang, lebar, tinggi) harus antara 0.01 dan 60 cm."
      );
      setIsSubmitting(false);
      return;
    }

    if (weightKg > 0) {
      const chargeableWeightRatio =
        (parseFloat(length) * parseFloat(width) * parseFloat(height)) /
        6000 /
        weightKg;
      if (chargeableWeightRatio >= 1.1) {
        toast.error(
          `Rasio berat yang dapat ditagih terlalu tinggi (${chargeableWeightRatio.toFixed(
            2
          )}). Seharusnya kurang dari 1.1.`
        );
        setIsSubmitting(false);
        return;
      }
    }
    // --- END: Frontend Validation ---

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("sku", sku);
      formData.append("price", price);
      formData.append("stock", stock);
      formData.append("minOrder", minOrder);
      formData.append("condition", condition);
      formData.append("status", status);
      formData.append("category", category);
      formData.append("weight", weight);
      formData.append("dimension", JSON.stringify(dimensions));
      formData.append("annotations", annotations);
      formData.append("brand", brand);

      // 4. Tambahkan data TikTok ke FormData untuk dikirim ke backend
      // Catatan: Backend controller perlu diupdate untuk menangani field ini
      if (tiktokCategoryId) {
        formData.append("tiktokCategoryId", tiktokCategoryId);
        formData.append(
          "tiktokProductAttributes",
          JSON.stringify(tiktokProductAttributes)
        );
        formData.append("categoryKeyword", categoryKeyword);
      }

      files.forEach((file) => {
        if (file) formData.append("pictures", file);
      });

      const success = await addProduct(formData);
      if (success) {
        toast.success("Produk berhasil ditambahkan!");
        // Reset form
        setFiles([]);
        setName("");
        setDescription("");
        setSku("");
        setPrice("");
        setStock("");
        setMinOrder("");
        setCondition("Baru");
        setStatus("active");
        setCategory("");
        setWeight("");
        setDimensions({ length: "", width: "", height: "" });
        setAnnotations("");
        setBrand("");
        // Reset juga state TikTok setelah berhasil
        setTiktokCategoryId("");
        setCategoryKeyword("");
        setTiktokProductAttributes([]);
      } else {
        toast.error("Gagal menambah produk");
      }
    } catch (err) {
      toast.error("Gagal menambah produk");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Tambah Produk Baru
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Image Upload Section */}
          <div>
            <h2 className="text-lg font-medium text-gray-700 mb-3">
              Gambar Produk
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex flex-col items-center">
                  <label
                    htmlFor={`image${index}`}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-accent transition-colors"
                  >
                    {files[index] ? (
                      <Image
                        src={URL.createObjectURL(files[index])}
                        alt="Preview"
                        width={200}
                        height={200}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Image
                          src={assets.upload_area}
                          alt="Upload"
                          width={48}
                          height={48}
                          className="mx-auto opacity-60"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Upload Gambar
                        </p>
                      </div>
                    )}
                    <input
                      onChange={(e) => {
                        const updatedFiles = [...files];
                        updatedFiles[index] = e.target.files[0];
                        setFiles(updatedFiles);
                      }}
                      type="file"
                      id={`image${index}`}
                      hidden
                      accept="image/png,image/jpeg,image/jpg"
                    />
                  </label>
                  {files[index] && (
                    <button
                      type="button"
                      onClick={() => {
                        const updatedFiles = [...files];
                        updatedFiles[index] = null;
                        setFiles(updatedFiles);
                      }}
                      className="mt-1 text-xs text-red-500 hover:text-red-700"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Basic Information Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-700">
              Informasi Dasar
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="product-name"
                >
                  Nama Produk*
                </label>
                <input
                  id="product-name"
                  type="text"
                  placeholder="Nama produk"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  minLength={25}
                  maxLength={255}
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="product-brand"
                >
                  Merek*
                </label>
                <input
                  id="product-brand"
                  type="text"
                  placeholder="Merek produk"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                  onChange={(e) => setBrand(e.target.value)}
                  value={brand}
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="product-sku"
                >
                  SKU*
                </label>
                <input
                  id="product-sku"
                  type="text"
                  placeholder="Kode SKU"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                  onChange={(e) => setSku(e.target.value)}
                  value={sku}
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="category"
                >
                  Kategori*
                </label>
                <select
                  id="category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                  onChange={(e) => setCategory(e.target.value)}
                  value={category}
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="product-price"
                >
                  Harga (Rp)*
                </label>
                <input
                  id="product-price"
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                  onChange={(e) => setPrice(e.target.value)}
                  value={price}
                  required
                />
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="product-description"
              >
                Deskripsi Produk*
              </label>
              <div className="relative border border-gray-300 rounded-md overflow-hidden bg-white focus-within:ring-1 focus-within:ring-accent focus-within:border-accent">
                <ReactQuill
                  theme="snow"
                  value={description}
                  onChange={(content, delta, source, editor) => {
                    setDescription(content);
                    const plainText = editor.getText().trim();
                    setDescriptionLength(plainText.length);
                  }}
                  modules={modules}
                  formats={formats}
                  placeholder="Deskripsi lengkap produk..."
                  className="[&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-toolbar]:bg-gray-50 [&_.ql-container]:border-0 [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:max-h-[400px] [&_.ql-editor]:overflow-y-auto [&_.ql-editor]:bg-white"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 flex justify-between">
                <span>Gunakan editor untuk memformat deskripsi produk Anda.</span>
                <span className={descriptionLength < 60 || descriptionLength > 10000 ? 'text-red-500 font-medium' : 'text-gray-500'}>
                  Karakter: {descriptionLength} (min 60, max 10000)
                </span>
              </p>
            </div>
          </div>

          {/* Inventory Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-700">Persediaan</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="product-stock"
                >
                  Stok*
                </label>
                <input
                  id="product-stock"
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                  onChange={(e) => setStock(e.target.value)}
                  value={stock}
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="min-order"
                >
                  Minimal Pesanan*
                </label>
                <input
                  id="min-order"
                  type="number"
                  placeholder="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                  onChange={(e) => setMinOrder(e.target.value)}
                  value={minOrder}
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="condition"
                >
                  Kondisi*
                </label>
                <select
                  id="condition"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                  onChange={(e) => setCondition(e.target.value)}
                  value={condition}
                  required
                >
                  <option value="Baru">Baru</option>
                  <option value="Bekas">Bekas</option>
                </select>
              </div>
            </div>
          </div>

          {/* Shipping Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-700">Pengiriman</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="weight"
                >
                  Berat (kg)*
                </label>
                <input
                  id="weight"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                  onChange={(e) => setWeight(e.target.value)}
                  value={weight}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dimensi (cm)*
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Panjang"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                    value={dimensions.length}
                    onChange={(e) =>
                      setDimensions((d) => ({ ...d, length: e.target.value }))
                    }
                    required
                  />
                  <input
                    type="number"
                    placeholder="Lebar"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                    value={dimensions.width}
                    onChange={(e) =>
                      setDimensions((d) => ({ ...d, width: e.target.value }))
                    }
                    required
                  />
                  <input
                    type="number"
                    placeholder="Tinggi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                    value={dimensions.height}
                    onChange={(e) =>
                      setDimensions((d) => ({ ...d, height: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="annotations"
            >
              Catatan Tambahan
            </label>
            <textarea
              id="annotations"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
              placeholder="Catatan tambahan tentang produk"
              onChange={(e) => setAnnotations(e.target.value)}
              value={annotations}
            ></textarea>
          </div>

          {/* --- 5. Render Komponen TikTok Shop --- */}
          <div className="pt-6 border-t border-gray-200">
            <ProductTiktokSection
              onAttributesChange={handleTiktokDataChange}
              // Tidak perlu initial value karena ini form tambah produk baru
            />
          </div>

          {/* Status */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="status"
              >
                Status Produk*
              </label>
              <select
                id="status"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                onChange={(e) => setStatus(e.target.value)}
                value={status}
                required
              >
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-md text-white font-medium ${
                isSubmitting
                  ? "bg-accent/70 cursor-not-allowed"
                  : "bg-accent hover:bg-accent/90"
              }`}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
