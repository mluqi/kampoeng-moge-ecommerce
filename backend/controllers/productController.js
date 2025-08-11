const {
  Product,
  Category,
  ProductViews,
  User,
  admin_akses,
} = require("../models");
const { getToken } = require("next-auth/jwt");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

// Helper function to safely parse JSON fields from a product object
const parseProductJSONFields = (productInstance) => {
  // Use .get({ plain: true }) to get a clean data object
  const product = productInstance.get({ plain: true });

  const fieldsToParse = [
    { key: "product_pictures", default: [] },
    { key: "product_dimensions", default: {} },
    { key: "product_attributes_tiktok", default: [] },
  ];

  for (const field of fieldsToParse) {
    const value = product[field.key];
    if (value && typeof value === "string") {
      try {
        product[field.key] = JSON.parse(value);
      } catch (e) {
        console.error(
          `Error parsing ${field.key} for product ${product.product_id}:`,
          e.message
        );
        product[field.key] = field.default; // Fallback to default on parsing error
      }
    } else if (!value) {
      product[field.key] = field.default; // Fallback to default if null/undefined
    }
  }
  return product;
};

function deleteFiles(files, subfolder) {
  if (!files || !Array.isArray(files) || !subfolder) return;
  files.forEach((file) => {
    if (typeof file !== "string" || !file) return;
    const filePath = path.join(
      __dirname,
      `../uploads/${subfolder}`,
      path.basename(file)
    );
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`Failed to delete file: ${filePath}`, err);
      }
    }
  });
}

async function generateProductId() {
  const lastProduct = await Product.findOne({
    order: [["product_id", "DESC"]],
  });
  let lastNumber = 0;
  if (lastProduct && lastProduct.product_id) {
    const match = lastProduct.product_id.match(/PD(\d+)/);
    if (match) lastNumber = parseInt(match[1], 10);
  }
  const nextNumber = (lastNumber + 1).toString().padStart(5, "0");
  return `PD${nextNumber}`;
}

async function generateCategoryId() {
  const lastCategory = await Category.findOne({
    order: [["category_id", "DESC"]],
  });
  let lastNumber = 0;
  if (lastCategory && lastCategory.category_id) {
    const match = lastCategory.category_id.match(/CAT(\d+)/);
    if (match) lastNumber = parseInt(match[1], 10);
  }
  const nextNumber = (lastNumber + 1).toString().padStart(3, "0");
  return `CAT${nextNumber}`;
}

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search, status } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    let whereClause = {};

    if (category && category !== "All") {
      whereClause.product_category = category;
    }

    if (search) {
      whereClause.product_name = {
        [Op.like]: `%${search}%`,
      };
    }

    if (status && ["active", "inactive"].includes(status)) {
      whereClause.product_status = status;
    }

    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      include: [{ model: Category, as: "category" }],
      limit: limitNum,
      offset: offset,
      order: [["product_id", "DESC"]],
    });

    res.status(200).json({
      data: rows.map(parseProductJSONFields), // Parse JSON fields before sending
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      totalProducts: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllProductsWithoutOutOfStock = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      status,
      sort = "newest",
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    let whereClause = {};

    whereClause.product_stock = { [Op.gt]: 0 };

    if (category && category !== "All") {
      whereClause.product_category = category;
    }

    if (search) {
      whereClause.product_name = {
        [Op.like]: `%${search}%`,
      };
    }

    if (status && ["active", "inactive"].includes(status)) {
      whereClause.product_status = status;
    }

    let orderClause = [];
    switch (sort) {
      case "highest-price":
        orderClause.push(["product_price", "DESC"]);
        break;
      case "lowest-price":
        orderClause.push(["product_price", "ASC"]);
        break;
      case "most-sold":
        orderClause.push(["product_sold", "DESC"]);
        break;
      case "newest":
      default:
        orderClause.push(["createdAt", "DESC"]);
    }

    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      include: [{ model: Category, as: "category" }],
      limit: limitNum,
      offset: offset,
      order: orderClause,
    });

    res.status(200).json({
      data: rows.map(parseProductJSONFields), // Parse JSON fields before sending
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      totalProducts: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: "category" }],
    });
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Parse the JSON fields before further processing and sending the response
    const parsedProduct = parseProductJSONFields(product);

    res.status(200).json(parsedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductStatusTiktok = async (req, res) => {
  console.log("Fetching TikTok product status for ID:", req.params.id);
  try {
    // --- START TIKTOK STATUS INTEGRATION ---
    const { getSingleProductDetails } = require("../services/tiktokShop");
    const tiktokResponse = await getSingleProductDetails(req.params.id);

    res.status(200).json({
      message: "Product status updated",
      status: tiktokResponse.data.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  const {
    name,
    description,
    sku,
    price,
    stock,
    condition,
    status,
    category,
    weight,
    dimension,
    annotations,
    brand,
    tiktokCategoryId,
    tiktokProductAttributes,
    categoryKeyword,
  } = req.body;

  if (
    !name ||
    !description ||
    !sku ||
    !price ||
    !stock ||
    !category ||
    !status ||
    !weight ||
    !dimension ||
    !condition ||
    !brand ||
    !tiktokCategoryId
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // --- START: TikTok API Validation ---
  if (name.length < 25 || name.length > 255) {
    return res
      .status(400)
      .json({ message: "Judul produk harus antara 25 dan 255 karakter." });
  }

  // Validasi panjang deskripsi (mengabaikan tag HTML untuk penghitungan)
  const plainTextDescription = description.replace(/<[^>]*>?/gm, "");
  if (plainTextDescription.length < 60 || plainTextDescription.length > 10000) {
    return res.status(400).json({
      message: "Deskripsi produk harus antara 60 dan 10.000 karakter.",
    });
  }

  try {
    const parsedDimensions = JSON.parse(dimension);
    const { length, width, height } = parsedDimensions;
    const weightKg = parseFloat(weight);

    if (
      length <= 0 ||
      length > 60 ||
      width <= 0 ||
      width > 60 ||
      height <= 0 ||
      height > 60
    ) {
      return res.status(400).json({
        message:
          "Setiap dimensi (panjang, lebar, tinggi) harus antara 0.01 dan 60 cm.",
      });
    }

    if (weightKg > 0) {
      const chargeableWeightRatio = (length * width * height) / 6000 / weightKg;
      if (chargeableWeightRatio >= 1.1) {
        return res.status(400).json({
          message: `Rasio berat yang dapat ditagih terlalu tinggi (${chargeableWeightRatio.toFixed(
            2
          )}). Seharusnya kurang dari 1.1. Rumus: (P x L x T / 6000) / Berat.`,
        });
      }
    }
  } catch (e) {
    return res.status(400).json({ message: "Format dimensi tidak valid." });
  }
  // --- END: TikTok API Validation ---

  let pictures = [];
  if (req.files && req.files.pictures && req.files.pictures.length > 0) {
    pictures = Array.isArray(req.files.pictures)
      ? req.files.pictures.map((file) => `/uploads/products/${file.filename}`)
      : [`/uploads/products/${req.files.pictures.filename}`];
  }

  const categoryExists = await Category.findByPk(category);

  if (!categoryExists) {
    deleteFiles(pictures, "products");
    return res.status(400).json({ message: "Category not found" });
  }

  try {
    // DYNAMIC IMPORT: Untuk memutus dependensi melingkar
    const {
      createProduct: createTiktokProduct,
      uploadImage: uploadTiktokImage,
    } = require("../services/tiktokShop");

    const product_id = await generateProductId();
    const product = await Product.create({
      product_id: product_id,
      product_name: name,
      product_description: description,
      product_sku: sku,
      product_price: price,
      product_stock: stock,
      product_condition: condition,
      product_status: status,
      product_category: category,
      product_categories_tiktok: tiktokCategoryId,
      product_attributes_tiktok: tiktokProductAttributes,
      product_keyword_search: categoryKeyword,
      product_weight: weight,
      product_dimensions: dimension,
      product_pictures: JSON.stringify(pictures), // Stringify the pictures array
      product_annotations: annotations,
      product_brand: brand,
    });

    // --- Integrasi TikTok Shop ---
    // Pastikan ada kategori dan gambar sebelum mencoba membuat di TikTok
    if (tiktokCategoryId && req.files?.pictures?.length > 0) {
      try {
        console.log("Starting TikTok Shop product creation...");

        // 1. Upload images to TikTok
        let imageUris = [];
        if (req.files?.pictures?.length > 0) {
          const uploadPromises = req.files.pictures.map((file) => {
            const imageBuffer = fs.readFileSync(file.path);
            return uploadTiktokImage(imageBuffer);
          });

          const uploadResults = await Promise.all(uploadPromises);
          imageUris = uploadResults
            .map((res) => {
              if (!res?.data?.uri) {
                console.error("A TikTok image upload failed:", res);
                return null;
              }
              return { uri: res.data.uri };
            })
            .filter(Boolean); // Filter out any nulls from failed uploads
        }

        if (imageUris.length === 0) {
          throw new Error(
            "At least one image is required for TikTok Shop, and all uploads failed."
          );
        }

        // 2. Prepare the product payload for TikTok
        const parsedDimensions = JSON.parse(dimension);
        const tiktokPayload = {
          title: name,
          description: description,
          category_id: tiktokCategoryId,
          main_images: imageUris,
          product_attributes: JSON.parse(tiktokProductAttributes),
          package_dimensions: {
            length: parsedDimensions.length,
            width: parsedDimensions.width,
            height: parsedDimensions.height,
            unit: "CENTIMETER",
          },
          package_weight: { value: weight, unit: "KILOGRAM" },
          skus: [
            {
              price: { amount: price, currency: "IDR" },
              inventory: [
                {
                  warehouse_id: process.env.TIKPED_WAREHOUSE_ID,
                  quantity: parseInt(stock, 10),
                },
              ],
              seller_sku: sku,
            },
          ],
        };

        const tiktokResponse = await createTiktokProduct(tiktokPayload);
        if (!tiktokResponse?.data?.product_id) {
          await product.destroy();
          deleteFiles(pictures);
          return res.status(500).json({ message: "Failed to create product" });
        }

        console.log(
          "✅ Product successfully created on TikTok Shop:",
          tiktokResponse?.data || tiktokResponse
        );

        // Simpan ID produk dari TikTok ke database lokal
        if (
          tiktokResponse?.data?.product_id &&
          tiktokResponse?.data?.skus?.[0].id
        ) {
          await product.update({
            product_tiktok_id: tiktokResponse.data.product_id,
            product_tiktok_sku_id: tiktokResponse.data.skus[0].id,
          });
          console.log(
            `Saved TikTok product ID ${tiktokResponse.data.product_id} to local product ${product.product_id}`
          );
        }
      } catch (tiktokError) {
        console.error(
          "❌ Failed to create product on TikTok Shop. The product was saved locally.",
          tiktokError
        );
      }
    }

    res.status(201).json(product);
  } catch (error) {
    deleteFiles(pictures);
    res.status(500).json({ message: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  console.log(req.body);
  const {
    name,
    description,
    sku,
    price,
    stock,
    condition,
    status,
    category,
    weight,
    dimension,
    annotations,
    brand,
    tiktokCategoryId,
    tiktokProductAttributes,
    categoryKeyword,
  } = req.body;

  let existingPictures = req.body.existingPictures || [];
  if (typeof existingPictures === "string") {
    existingPictures = [existingPictures];
  }

  let pictures = [];
  if (req.files && req.files.pictures && req.files.pictures.length > 0) {
    pictures = Array.isArray(req.files.pictures)
      ? req.files.pictures.map((file) => `/uploads/products/${file.filename}`)
      : [`/uploads/products/${req.files.pictures.filename}`];
  } else {
    console.log("No new pictures uploaded");
    pictures = [];
  }

  // --- START: TikTok API Validation ---
  if (name && (name.length < 25 || name.length > 255)) {
    return res
      .status(400)
      .json({ message: "Judul produk harus antara 25 dan 255 karakter." });
  }

  if (
    description &&
    (description.replace(/<[^>]*>?/gm, "").length < 60 ||
      description.length > 10000)
  ) {
    return res.status(400).json({
      message: "Deskripsi produk harus antara 60 dan 10.000 karakter.",
    });
  }

  try {
    const parsedDimensions = JSON.parse(dimension);
    const { length, width, height } = parsedDimensions;
    const weightKg = parseFloat(weight);

    if (
      length <= 0 ||
      length > 60 ||
      width <= 0 ||
      width > 60 ||
      height <= 0 ||
      height > 60
    ) {
      return res.status(400).json({
        message:
          "Setiap dimensi (panjang, lebar, tinggi) harus antara 0.01 dan 60 cm.",
      });
    }

    if (weightKg > 0) {
      const chargeableWeightRatio = (length * width * height) / 6000 / weightKg;
      if (chargeableWeightRatio >= 1.1) {
        return res.status(400).json({
          message: `Rasio berat yang dapat ditagih terlalu tinggi (${chargeableWeightRatio.toFixed(
            2
          )}). Seharusnya kurang dari 1.1. Rumus: (P x L x T / 6000) / Berat.`,
        });
      }
    }
  } catch (e) {
    return res.status(400).json({ message: "Format dimensi tidak valid." });
  }
  // --- END: TikTok API Validation ---

  try {
    // DYNAMIC IMPORT: Untuk memutus dependensi melingkar
    const {
      createProduct: createTiktokProduct,
      updateProduct: updateTiktokProduct,
      uploadImage: uploadTiktokImage,
    } = require("../services/tiktokShop");

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      deleteFiles(pictures);
      return res.status(404).json({ message: "Product not found" });
    }

    let oldPictures = [];
    if (
      product.product_pictures &&
      typeof product.product_pictures === "string"
    ) {
      try {
        const parsed = JSON.parse(product.product_pictures);
        // Pastikan hasil parse adalah array
        if (Array.isArray(parsed)) {
          oldPictures = parsed;
        }
      } catch (e) {
        console.error(
          `Gagal mem-parsing product_pictures lama untuk produk ${req.params.id}:`,
          e
        );
      }
    }
    // Gabungkan gambar yang ada (yang tidak dihapus) dengan gambar baru.
    // Gunakan Set untuk secara otomatis menangani duplikasi.
    const finalPictures = [...new Set([...existingPictures, ...pictures])];

    const picturesToDelete = oldPictures.filter(
      (oldPic) => !finalPictures.includes(oldPic)
    );
    deleteFiles(picturesToDelete);

    await product.update({
      product_name: name,
      product_description: description,
      product_sku: sku,
      product_price: price,
      product_stock: stock,
      product_condition: condition,
      product_status: status,
      product_category: category,
      product_categories_tiktok: tiktokCategoryId,
      product_attributes_tiktok: tiktokProductAttributes,
      product_keyword_search: categoryKeyword,
      product_weight: weight,
      product_dimensions: dimension,
      product_pictures: JSON.stringify(finalPictures), // Stringify the pictures array
      product_annotations: annotations,
      product_brand: brand,
    });

    // --- Integrasi TikTok Shop ---
    if (tiktokCategoryId) {
      try {
        // 1. Handle image uploads (gabungkan gambar yang ada dan yang baru)
        const allImageFiles = [
          ...(existingPictures || []),
          ...(req.files?.pictures || []),
        ];

        let imageUris = [];
        if (allImageFiles.length > 0) {
          const uploadPromises = allImageFiles
            .map((file) => {
              // file bisa berupa path string atau objek file dari multer
              const filePath =
                typeof file === "string"
                  ? path.join(__dirname, "..", file.substring(1)) // Sesuaikan path relatif
                  : file.path;

              if (!fs.existsSync(filePath)) {
                console.warn(
                  `File gambar tidak ditemukan, dilewati: ${filePath}`
                );
                return null;
              }
              const imageBuffer = fs.readFileSync(filePath);
              return uploadTiktokImage(imageBuffer);
            })
            .filter(Boolean);

          const uploadResults = await Promise.all(uploadPromises);
          imageUris = uploadResults
            .map((res) => (res?.data?.uri ? { uri: res.data.uri } : null))
            .filter(Boolean);
        }

        // 2. Siapkan payload TikTok
        const parsedDimensions = JSON.parse(dimension);
        const tiktokPayload = {
          title: name,
          description: description,
          category_id: tiktokCategoryId,
          ...(imageUris.length > 0 && { main_images: imageUris }), // Hanya sertakan jika ada gambar
          product_attributes: JSON.parse(tiktokProductAttributes),
          package_dimensions: {
            length: parsedDimensions.length,
            width: parsedDimensions.width,
            height: parsedDimensions.height,
            unit: "CENTIMETER",
          },
          package_weight: { value: weight, unit: "KILOGRAM" },
          skus: [
            {
              price: { amount: price, currency: "IDR" },
              inventory: [
                {
                  warehouse_id: process.env.TIKPED_WAREHOUSE_ID,
                  quantity: parseInt(stock, 10),
                },
              ],
              seller_sku: sku,
            },
          ],
        };

        // 3. Tentukan apakah akan membuat baru atau memperbarui di TikTok
        if (product.product_tiktok_id) {
          console.log(
            `Updating product on TikTok Shop (ID: ${product.product_tiktok_id})...`
          );
          const tiktokResponse = await updateTiktokProduct(
            product.product_tiktok_id,
            tiktokPayload
          );
          console.log(
            "✅ Product successfully updated on TikTok Shop:",
            tiktokResponse?.data || tiktokResponse
          );
        } else {
          console.log("Product does not exist on TikTok Shop, creating new...");
          const tiktokResponse = await createTiktokProduct(tiktokPayload);
          console.log(
            "✅ Product successfully created on TikTok Shop:",
            tiktokResponse?.data || tiktokResponse
          );
          if (tiktokResponse?.data?.product_id) {
            await product.update({
              product_tiktok_id: tiktokResponse.data.product_id,
            });
            console.log(
              `Saved new TikTok product ID ${tiktokResponse.data.product_id} to local product ${product.product_id}`
            );
          }
        }
      } catch (tiktokError) {
        console.error(
          "❌ Failed to sync product with TikTok Shop. The product was updated locally.",
          tiktokError
        );
      }
    }

    res.status(200).json(product);
  } catch (error) {
    deleteFiles(pictures); // Jika update gagal, hapus file yang baru diunggah
    res.status(500).json({ message: error.message });
  }
};

exports.updateProductStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }
    product.product_status = status;
    await product.save();
    res.status(200).json({ message: "Status produk berhasil diubah", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Helper function to sync stock to TikTok Shop.
 * This can be called from order creation, cancellation, or manual stock updates.
 * @param {string} productId - The local product ID (e.g., 'PD00001')
 * @param {number} newStock - The new stock quantity.
 */
exports.syncStockToTiktok = async function (productId, newStock) {
  try {
    const product = await Product.findByPk(productId);

    // 1. Check if the product exists and is linked to TikTok
    if (
      !product ||
      !product.product_tiktok_id ||
      !product.product_tiktok_sku_id
    ) {
      console.log(
        `Product ${productId} is not fully linked to TikTok Shop (missing product or SKU ID). Skipping sync.`
      );
      return;
    }

    // 2. DYNAMIC IMPORT: To avoid circular dependencies
    const {
      updateInventory: updateTiktokInventory,
    } = require("../services/tiktokShop");

    // 3. Prepare the payload for inventory update
    const skusPayload = [
      {
        id: product.product_tiktok_sku_id,
        inventory: [
          {
            quantity: parseInt(newStock, 10),
          },
        ],
      },
    ];

    console.log(
      `Syncing stock for product ${productId} (TikTok ID: ${product.product_tiktok_id}) to ${newStock}...`
    );
    await updateTiktokInventory(product.product_tiktok_id, skusPayload);
    console.log(
      `✅ Stock for product ${productId} successfully synced to TikTok Shop.`
    );
  } catch (error) {
    console.error(
      `❌ Failed to sync stock for product ${productId} to TikTok Shop.`,
      error
    );
    // It's important not to throw the error here to avoid breaking the main flow (like order creation).
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Parse product_pictures from string to array before deleting files
    if (product.product_pictures) {
      try {
        const picturesArray = JSON.parse(product.product_pictures);
        if (picturesArray && picturesArray.length > 0) {
          deleteFiles(picturesArray);
        }
      } catch (e) {
        console.error(
          `Could not parse product_pictures for product ${req.params.id} on delete`,
          e
        );
      }
    }
    await product.destroy();
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addCategory = async (req, res) => {
  const { category_name } = req.body;
  if (!category_name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  let picturePath = null;
  if (req.files && req.files.pictures && req.files.pictures.length > 0) {
    // Ambil hanya gambar pertama, agar konsisten dengan logika update
    picturePath = `/uploads/category/${req.files.pictures[0].filename}`;
  }

  try {
    const category_id = await generateCategoryId();
    const category = await Category.create({
      category_id,
      category_name,
      category_image: picturePath, // Simpan path string, bukan array
    });
    res.status(201).json(category);
  } catch (error) {
    if (picturePath) {
      // Hapus file yang baru diunggah jika terjadi error
      deleteFiles([picturePath], "category");
    }
    res.status(500).json({ message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  const { category_name } = req.body;
  if (!category_name) {
    return res.status(400).json({ message: "Category name is required" });
  }
  let newPicturePath = null;
  if (req.files && req.files.pictures && req.files.pictures.length > 0) {
    newPicturePath = `/uploads/category/${req.files.pictures[0].filename}`;
  }
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      if (newPicturePath) {
        deleteFiles([newPicturePath], "category");
      }
      return res.status(404).json({ message: "Category not found" });
    }
    const oldPicturePath = category.category_image;
    const updateData = { category_name, category_image: oldPicturePath };

    // Jika ada gambar baru, update path gambar dan hapus yang lama
    if (newPicturePath) {
      updateData.category_image = newPicturePath;
      if (oldPicturePath) {
        deleteFiles([oldPicturePath], "category");
      }
    }

    await category.update(updateData);

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Hapus gambar terkait jika ada sebelum menghapus record
    if (category.category_image) {
      deleteFiles([category.category_image], "category");
    }

    await category.destroy();
    res.status(200).json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const products = await Product.findAll({
      where: { product_category: category.category_id },
      include: [{ model: Category, as: "category" }],
    });

    res.status(200).json(products.map(parseProductJSONFields)); // Parse JSON fields
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- TikTok Shop Specific Actions ---

exports.activateTiktokProduct = async (req, res) => {
  try {
    const { product_ids } = req.body;
    if (
      !product_ids ||
      !Array.isArray(product_ids) ||
      product_ids.length === 0
    ) {
      return res.status(400).json({ message: "Product IDs are required." });
    }

    const { activateProduct } = require("../services/tiktokShop");
    const result = await activateProduct(product_ids);

    res.status(200).json({
      message: "Produk berhasil diaktifkan di TikTok Shop.",
      data: result,
    });
  } catch (error) {
    console.error("Error activating TikTok product:", error);
    res.status(500).json({
      message: "Gagal mengaktifkan produk di TikTok Shop.",
      details: error,
    });
  }
};

exports.deactivateTiktokProduct = async (req, res) => {
  try {
    const { product_ids } = req.body;
    if (
      !product_ids ||
      !Array.isArray(product_ids) ||
      product_ids.length === 0
    ) {
      return res.status(400).json({ message: "Product IDs are required." });
    }

    const { deactivateProduct } = require("../services/tiktokShop");
    const result = await deactivateProduct(product_ids);

    res.status(200).json({
      message: "Produk berhasil dinonaktifkan di TikTok Shop.",
      data: result,
    });
  } catch (error) {
    console.error("Error deactivating TikTok product:", error);
    res.status(500).json({
      message: "Gagal menonaktifkan produk di TikTok Shop.",
      details: error,
    });
  }
};

exports.getAllCategoryOnTiktokShop = async (req, res) => {
  const { keyword } = req.query;

  try {
    const options = {};
    if (keyword) {
      options.keyword = keyword;
    }

    // DYNAMIC IMPORT: Untuk memutus dependensi melingkar
    const { getCategories } = require("../services/tiktokShop");

    const tiktokResponse = await getCategories(options);

    // Service `getCategories` sudah memfilter dan mengembalikan struktur respons.
    // Kita bisa langsung mengirim array kategori dari data respons.
    if (
      tiktokResponse &&
      tiktokResponse.data &&
      tiktokResponse.data.categories
    ) {
      res.status(200).json(tiktokResponse.data.categories);
    } else {
      // Kasus ini menangani jika API mengembalikan respons sukses tetapi tanpa struktur data yang diharapkan.
      res.status(200).json([]);
    }
  } catch (error) {
    // Error dari service adalah body respons dari API TikTok.
    console.error("Error fetching TikTok Shop categories:", error);

    const statusCode =
      error.code && String(error.code).startsWith("4") ? 400 : 500;

    res.status(statusCode).json({
      message: "Gagal mengambil kategori dari TikTok Shop.",
      details: error,
    });
  }
};

exports.getCategoryAttributesOnTiktokShop = async (req, res) => {
  const { categoryId } = req.params;

  if (!categoryId) {
    return res.status(400).json({ message: "Category ID is required." });
  }

  try {
    // DYNAMIC IMPORT: Untuk memutus dependensi melingkar
    const { getCategoryAttributes } = require("../services/tiktokShop");

    const tiktokResponse = await getCategoryAttributes(categoryId);

    if (
      tiktokResponse &&
      tiktokResponse.data &&
      tiktokResponse.data.attributes
    ) {
      res.status(200).json(tiktokResponse.data.attributes);
    } else {
      // Menangani kasus jika API mengembalikan sukses tetapi tanpa atribut
      res.status(200).json([]);
    }
  } catch (error) {
    // Error dari service adalah body respons dari API TikTok.
    console.error(
      `Error fetching attributes for category ${categoryId}:`,
      error
    );

    const statusCode =
      error.code && String(error.code).startsWith("4") ? 400 : 500;

    res.status(statusCode).json({
      message: "Gagal mengambil atribut kategori dari TikTok Shop.",
      details: error,
    });
  }
};

/**
 * @description Mencatat view untuk produk tertentu.
 * @route POST /api/products/:id/view
 * @access Public (atau terautentikasi, sesuai kebutuhan)
 */
exports.recordProductView = async (req, res) => {
  const { id: productId } = req.params;

  // --- START: Pengecekan Admin ---
  // Cek apakah ada token admin di header. Jika ada dan valid, jangan catat view.
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const adminToken = authHeader.split(" ")[1];
    try {
      // Verifikasi token admin
      const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
      if (decoded && decoded.role === "admin") {
        // Jika token valid dan rolenya adalah admin, hentikan proses.
        return res.status(200).json({ message: "Admin view is not recorded." });
      }
    } catch (err) {
      // Token tidak valid atau kedaluwarsa. Abaikan dan lanjutkan sebagai user biasa.
    }
  }
  // --- END: Pengecekan Admin ---

  try {
    // Cek apakah produk ada
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }

    // Opsional: Ambil user ID jika user login
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    let userId = null;
    if (token && token.email) {
      const user = await User.findOne({ where: { user_email: token.email } });
      if (user) userId = user.user_id;
    }

    // Jika pengguna sudah login, periksa apakah mereka sudah melihat produk ini hari ini.
    if (userId) {
      // Tentukan awal hari ini (pukul 00:00:00)
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const existingView = await ProductViews.findOne({
        where: {
          product_id: productId,
          user_id: userId,
          viewed_at: {
            [Op.gte]: startOfToday, // Cek apakah sudah ada view sejak awal hari ini
          },
        },
      });

      // Jika sudah ada view hari ini, jangan catat lagi dan kirim respons sukses.
      if (existingView) {
        return res
          .status(200)
          .json({ message: "Tampilan sudah dicatat hari ini." });
      }
    }

    // Buat catatan view baru jika pengguna anonim, atau jika pengguna yang login belum melihatnya hari ini.
    await ProductViews.create({
      product_id: productId,
      user_id: userId, // Bisa null untuk user anonim
      viewed_at: new Date(),
    });

    res.status(200).json({ message: "Tampilan produk berhasil dicatat." });
  } catch (error) {
    console.error("Error saat mencatat tampilan produk:", error);
    res.status(500).json({ message: "Gagal mencatat tampilan produk." });
  }
};
