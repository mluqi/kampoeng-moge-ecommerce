const { Product, Category } = require("../models");
const { getToken } = require("next-auth/jwt");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");

function deleteFiles(files) {
  if (!files) return;
  files.forEach((file) => {
    const filePath = path.join(
      __dirname,
      "../uploads/products",
      path.basename(file)
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
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
    const { page = 1, limit = 12, category, search } = req.query;

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

    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      include: [{ model: Category, as: "category" }],
      limit: limitNum,
      offset: offset,
      order: [["product_id", "DESC"]],
    });

    res.status(200).json({
      data: rows,
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
  // const token = await getToken({
  //   req,
  //   secret: process.env.NEXTAUTH_SECRET,
  //   secureCookie: process.env.NODE_ENV === "production",
  // });
  // if (!token) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }

  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: "category" }],
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
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
    !condition
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // const token = await getToken({
  //   req,
  //   secret: process.env.NEXTAUTH_SECRET,
  //   secureCookie: process.env.NODE_ENV === "production",
  // });

  // if (!token) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }

  let pictures = [];
  if (req.files && req.files.pictures && req.files.pictures.length > 0) {
    pictures = req.files.pictures.map(
      (file) => `/uploads/products/${file.filename}`
    );
  }

  const categoryExists = await Category.findByPk(category);

  if (!categoryExists) {
    deleteFiles(pictures);
    return res.status(400).json({ message: "Category not found" });
  }

  try {
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
      product_weight: weight,
      product_dimensions: dimension,
      product_pictures: pictures,
      product_annotations: annotations,
    });
    res.status(201).json(product);
  } catch (error) {
    deleteFiles(pictures);
    res.status(500).json({ message: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
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
  } = req.body;

  // const token = await getToken({
  //   req,
  //   secret: process.env.NEXTAUTH_SECRET,
  //   secureCookie: process.env.NODE_ENV === "production",
  // });

  // if (!token) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }

  let pictures = [];
  if (req.files && req.files.pictures && req.files.pictures.length > 0) {
    pictures = req.files.pictures.map(
      (file) => `/uploads/products/${file.filename}`
    );
  }

  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      deleteFiles(pictures);
      return res.status(404).json({ message: "Product not found" });
    }

    if (
      pictures.length > 0 &&
      product.product_pictures &&
      product.product_pictures.length > 0
    ) {
      deleteFiles(product.product_pictures);
    }

    await product.update({
      product_name: name,
      product_description: description,
      product_sku: sku,
      product_price: price,
      product_stock: stock,
      product_condition: condition,
      product_status: status,
      product_category: category,
      product_weight: weight,
      product_dimensions: dimension,
      product_pictures:
        pictures.length > 0 ? pictures : product.product_pictures,
      product_annotations: annotations,
    });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  // const token = await getToken({
  //   req,
  //   secret: process.env.NEXTAUTH_SECRET,
  //   secureCookie: process.env.NODE_ENV === "production",
  // });

  // if (!token) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }

  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.product_pictures && product.product_pictures.length > 0) {
      deleteFiles(product.product_pictures);
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

exports.addCategory = async (req, res) => {
  const { category_name } = req.body;
  if (!category_name) {
    return res.status(400).json({ message: "Category name is required" });
  }
  try {
    const category_id = await generateCategoryId();
    const category = await Category.create({ category_id, category_name });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  const { category_name } = req.body;
  if (!category_name) {
    return res.status(400).json({ message: "Category name is required" });
  }
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    await category.update({ category_name: category_name });
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

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
