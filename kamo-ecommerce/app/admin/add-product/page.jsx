"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";

import { useProduct } from "@/contexts/ProductContext";
import { useCategory } from "@/contexts/CategoryContext";

const AddProduct = () => {
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
  const [msg, setMsg] = useState("");

  // Untuk validasi dan submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
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

      files.forEach((file) => {
        if (file) formData.append("pictures", file);
      });

      const success = await addProduct(formData);
      if (success) {
        setMsg("Produk berhasil ditambahkan!");
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
      } else {
        setMsg("Gagal menambah produk.");
      }
    } catch (err) {
      setMsg("Gagal menambah produk.");
    }
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-5 max-w-lg">
        <div>
          <p className="text-base font-medium">Product Image</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {[...Array(4)].map((_, index) => (
              <label key={index} htmlFor={`image${index}`}>
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
                <Image
                  className="max-w-24 cursor-pointer"
                  src={
                    files[index]
                      ? URL.createObjectURL(files[index])
                      : assets.upload_area
                  }
                  alt=""
                  width={100}
                  height={100}
                />
              </label>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-name">
            Product Name
          </label>
          <input
            id="product-name"
            type="text"
            placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            onChange={(e) => setName(e.target.value)}
            value={name}
            required
          />
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label
            className="text-base font-medium"
            htmlFor="product-description"
          >
            Product Description
          </label>
          <textarea
            id="product-description"
            rows={4}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
            placeholder="Type here"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            required
          ></textarea>
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-sku">
            SKU
          </label>
          <input
            id="product-sku"
            type="text"
            placeholder="SKU"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            onChange={(e) => setSku(e.target.value)}
            value={sku}
            required
          />
        </div>
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setCategory(e.target.value)}
              value={category}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
            {/* Untuk production, sebaiknya gunakan dropdown kategori dari DB */}
          </div>
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="product-price">
              Product Price
            </label>
            <input
              id="product-price"
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              required
            />
          </div>
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="product-stock">
              Stock
            </label>
            <input
              id="product-stock"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setStock(e.target.value)}
              value={stock}
              required
            />
          </div>
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="min-order">
              Min Order
            </label>
            <input
              id="min-order"
              type="number"
              placeholder="1"
              inputMode="numeric"
              pattern="[0-9]*"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setMinOrder(e.target.value)}
              value={minOrder}
              required
            />
          </div>
        </div>
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="condition">
              Condition
            </label>
            <select
              id="condition"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setCondition(e.target.value)}
              value={condition}
              required
            >
              <option value="Baru">Baru</option>
              <option value="Bekas">Bekas</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setStatus(e.target.value)}
              value={status}
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="weight">
              Weight (kg)
            </label>
            <input
              id="weight"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setWeight(e.target.value)}
              value={weight}
              required
            />
          </div>
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="dimensions">
            Dimensions (cm)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Length"
              className="outline-none py-2 px-2 rounded border border-gray-500/40 w-20"
              value={dimensions.length}
              onChange={(e) =>
                setDimensions((d) => ({ ...d, length: e.target.value }))
              }
              required
            />
            <input
              type="number"
              placeholder="Width"
              className="outline-none py-2 px-2 rounded border border-gray-500/40 w-20"
              value={dimensions.width}
              onChange={(e) =>
                setDimensions((d) => ({ ...d, width: e.target.value }))
              }
              required
            />
            <input
              type="number"
              placeholder="Height"
              className="outline-none py-2 px-2 rounded border border-gray-500/40 w-20"
              value={dimensions.height}
              onChange={(e) =>
                setDimensions((d) => ({ ...d, height: e.target.value }))
              }
              required
            />
          </div>
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="annotations">
            Annotations
          </label>
          <textarea
            id="annotations"
            rows={2}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
            placeholder="Type here"
            onChange={(e) => setAnnotations(e.target.value)}
            value={annotations}
          ></textarea>
        </div>
        {msg && <div className="text-sm text-accent font-medium">{msg}</div>}
        <button
          type="submit"
          className="px-8 py-2.5 bg-accent text-white font-medium rounded"
        >
          ADD
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
