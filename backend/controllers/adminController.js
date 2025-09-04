const { admin_akses, sequelize } = require("../models");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

// Get All Admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await admin_akses.findAll({
      attributes: ["id", "name", "email", "phone", "photo"],
    });
    res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching all admins:", error);
  }
};

exports.getAdminById = async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await admin_akses.findByPk(id, {
      attributes: ["id", "name", "email", "phone", "photo"],
    });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json(admin);
  } catch (error) {
    console.error("Error fetching admin by ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.createAdmin = async (req, res) => {
  const { name, phone, email, password } = req.body;

  if (!name || !phone || !email || !password) {
    return res.status(400).json("Semua field diperlukan");
  }

  try {
    const existingAdmin = await admin_akses.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json("Admin sudah terdaftar");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await admin_akses.create({
      name,
      phone,
      email,
      password: hashedPassword,
    });
    res.status(201).json(admin);
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateAdminInfo = async (req, res) => {
  const { id } = req.params;
  const { name, phone, email } = req.body;
  console.log(req.body);
  console.log(req.query);

  if (!name || !phone || !email) {
    return res.status(400).json("Semua field diperlukan");
  }

  try {
    const admin = await admin_akses.findByPk(id);
    if (!admin) {
      return res.status(404).json("Admin tidak ditemukan");
    }

    admin.name = name;
    admin.phone = phone;
    admin.email = email;

    await admin.save();
    res.status(200).json(admin);
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateAdminPassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json("Password baru diperlukan");
  }
  try {
    const admin = await admin_akses.findByPk(id);
    if (!admin) {
      return res.status(404).json("Admin tidak ditemukan");
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    admin.password = hashedPassword;
    await admin.save();
    res.status(200).json(admin);
  } catch (error) {
    console.error("Error updating admin password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await admin_akses.findByPk(id);
    if (!admin) {
      return res.status(404).json("Admin tidak ditemukan");
    }

    await admin.destroy();
    res.status(200).json({ message: "Admin berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
