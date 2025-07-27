const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { admin_akses } = require("../models");
const { User, Addresses, sequelize } = require("../models");
const { getToken } = require("next-auth/jwt");

const getUserFromToken = async (req) => {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });
  if (!token) return null;
  return User.findOne({ where: { user_email: token.email } });
};

// Admin Signin
exports.adminSignin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await admin_akses.findOne({ where: { email } });
    if (!admin) {
      return res.status(404).json({ message: "Admin tidak ditemukan" });
    }
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Password salah" });
    }
    const token = jwt.sign(
      { id: admin.id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    await admin_akses.update({ token }, { where: { id: admin.id } });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

// Get Admin Profile
exports.getAdminProfile = async (req, res) => {
  try {
    // authMiddleware attaches user data (including id) to req.user
    const adminId = req.user.id;
    const admin = await admin_akses.findByPk(adminId, {
      attributes: ["id", "name", "email", "photo"], // Exclude sensitive fields like password
    });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
};

// Fungsi ini akan dipanggil oleh NextAuth.js setelah autentikasi Google berhasil
exports.googleAuthCallback = async (req, res) => {
  const { googleId, name, email, photo } = req.body;

  try {
    let user = await User.findOne({ where: { user_google_id: googleId } });

    if (!user) {
      // Pengguna belum ada, buat entri baru di database
      user = await User.create({
        user_google_id: googleId,
        user_name: name,
        user_email: email,
        user_photo: photo,
        // Anda bisa menambahkan field lain seperti user_address, user_phone dengan nilai default
      });
      console.log("Pengguna baru dibuat via Google:", user.user_email);
    } else {
      // Pengguna sudah ada, perbarui informasinya jika perlu
      // user.user_name = name;
      user.user_email = email; // Pastikan email selalu up-to-date
      user.user_photo = photo;
      await user.save();
      console.log(
        "Pengguna yang sudah ada diperbarui via Google:",
        user.user_email
      );
    }
    // Kirim respons sukses ke NextAuth.js dengan data pengguna dari database kita
    res.status(200).json({
      success: true,
      message: "Data pengguna berhasil diproses.",
      user: {
        id: user.user_id, // Kirim ID primary key dari database Anda
        name: user.user_name,
        email: user.user_email,
        photo: user.user_photo,
        role: "user", // Definisikan peran secara eksplisit
      },
    });
  } catch (error) {
    console.error(
      "Kesalahan saat memproses pengguna Google di backend:",
      error
    );
    res
      .status(500)
      .json({ success: false, message: "Gagal memproses data pengguna." });
  }
};

//logout (Admin)
exports.adminLogout = async (req, res) => {
  try {
    const adminId = req.user.id;
    const admin = await admin_akses.findByPk(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin tidak ditemukan" });
    }
    await admin_akses.update({ token: null }, { where: { id: adminId } });
    res.status(200).json({ message: "Logout berhasil" });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

// Change Password (Admin)
exports.changePassword = async (req, res) => {
  const { old_password, new_password, confirm_new_password } = req.body;
  const adminId = req.user.id; // Pastikan middleware mengisi req.user

  if (!old_password || !new_password || !confirm_new_password) {
    return res
      .status(400)
      .json({ message: "Semua field password diperlukan." });
  }
  if (new_password !== confirm_new_password) {
    return res
      .status(400)
      .json({ message: "Password baru dan konfirmasi password tidak cocok." });
  }
  if (new_password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password baru minimal 6 karakter." });
  }

  try {
    const admin = await admin_akses.findByPk(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin tidak ditemukan." });
    }
    const isMatch = await bcrypt.compare(old_password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password lama salah." });
    }
    const hashedPassword = await bcrypt.hash(new_password, 10);
    admin.password = hashedPassword;
    await admin.save();
    res.status(200).json({ message: "Password berhasil diubah." });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

// Reset Password (Admin)
exports.resetPassword = async (req, res) => {
  const { email, new_password, confirm_new_password } = req.body;

  if (!email || !new_password || !confirm_new_password) {
    return res
      .status(400)
      .json({ message: "Email dan password baru diperlukan." });
  }
  if (new_password !== confirm_new_password) {
    return res
      .status(400)
      .json({ message: "Password baru dan konfirmasi password tidak cocok." });
  }
  if (new_password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password baru minimal 6 karakter." });
  }

  try {
    const admin = await admin_akses.findOne({ where: { email } });
    if (!admin) {
      return res.status(404).json({ message: "Admin tidak ditemukan." });
    }
    const hashedPassword = await bcrypt.hash(new_password, 10);
    admin.password = hashedPassword;
    await admin.save();
    res.status(200).json({ message: "Password berhasil direset." });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

exports.getProfile = async (req, res) => {
  try {
    // Ambil token dari cookie NextAuth
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    });

    if (!token) {
      return res
        .status(401)
        .json({ message: "Token tidak tersedia, akses ditolak." });
    }

    // Cari user berdasarkan email dari token, sertakan relasi addresses
    const user = await User.findOne({
      where: { user_email: token.email },
      attributes: [
        "user_id",
        "user_name",
        "user_email",
        "user_photo",
        "user_phone",
        "user_google_id",
      ],
      include: [
        {
          model: Addresses,
          as: "addresses",
          attributes: [
            "address_id",
            "address_full_name",
            "address_phone",
            "address_pincode",
            "address_area",
            "address_city",
            "address_state",
            "address_country",
            "address_label",
            "address_is_default",
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    // Format respons agar konsisten dan mudah digunakan di frontend
    return res.status(200).json({
      user: {
        id: user.user_id,
        name: user.user_name,
        email: user.user_email,
        photo: user.user_photo,
        phone: user.user_phone,
        google_id: user.user_google_id,
        addresses: user.addresses || [],
      },
    });
  } catch (error) {
    console.error("Error in getProfile:", error);
    return res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan di server." });
  }
};

//edit profile
exports.editProfile = async (req, res) => {
  const { name, phone } = req.body;
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  if (!token) {
    return res
      .status(401)
      .json({ message: "Token tidak tersedia, akses ditolak." });
  }
  try {
    const user = await User.findOne({ where: { user_email: token.email } });
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    // Validasi input
    if (!name || !phone) {
      return res
        .status(400)
        .json({ message: "Nama dan nomor telepon wajib diisi." });
    }

    // Update data user
    user.user_name = name;
    user.user_phone = phone;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profil berhasil diperbarui.",
      user: {
        id: user.user_id,
        name: user.user_name,
        email: user.user_email,
        phone: user.user_phone,
        photo: user.user_photo,
      },
    });
  } catch (error) {
    console.error("Error in editProfile:", error);
    return res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan di server." });
  }
};

exports.addAddress = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    // Ambil data address dari body
    const {
      address_id, // address_id tidak digunakan saat menambah, tapi kita destrukturisasi agar tidak masuk ke create
      fullName,
      phoneNumber,
      pincode,
      area,
      city,
      state,
      country,
      label,
      isDefault,
    } = req.body;

    if (!fullName || !phoneNumber || !pincode || !area || !city || !state) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Semua field alamat wajib diisi." });
    }

    // Cek apakah ada alamat lain, jika tidak, paksa isDefault menjadi true
    const addressCount = await Addresses.count({
      where: { address_user: user.user_id },
      transaction: t,
    });

    // Jika ini alamat pertama, jadikan default. Jika tidak, periksa flag isDefault.
    const makeDefault = addressCount === 0 ? true : isDefault;

    if (makeDefault) {
      // Hapus status default dari alamat lain jika ada
      await Addresses.update(
        { address_is_default: false },
        { where: { address_user: user.user_id }, transaction: t }
      );
    }

    // Simpan address baru
    const address = await Addresses.create({
      address_user: user.user_id,
      address_full_name: fullName,
      address_phone: phoneNumber,
      address_pincode: pincode,
      address_area: area,
      address_city: city,
      address_state: state,
      address_country: country || "",
      address_label: label || "",
      address_is_default: makeDefault,
    }, { transaction: t });

    await t.commit();
    return res
      .status(201)
      .json({ message: "Alamat berhasil ditambahkan.", address });
  } catch (error) {
    await t.rollback();
    console.error("Error in addAddress:", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

exports.editAddress = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    const { id: addressId } = req.params;
    // Ambil data dari body
    const {
      fullName,
      phoneNumber,
      pincode,
      area,
      city,
      state,
      country,
      label,
    } = req.body;

    // Cari address milik user
    const address = await Addresses.findOne({
      where: {
        address_id: addressId,
        address_user: user.user_id,
      },
      transaction: t,
    });

    if (!address) {
      await t.rollback();
      return res.status(404).json({ message: "Alamat tidak ditemukan." });
    }

    // Update field yang diizinkan
    await address.update({
      address_full_name: fullName,
      address_phone: phoneNumber,
      address_pincode: pincode,
      address_area: area,
      address_city: city,
      address_state: state,
      address_country: country,
      address_label: label,
    }, { transaction: t });

    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Alamat berhasil diperbarui.",
      address,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error in editAddress:", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    const { id: addressId } = req.params;

    if (!addressId) {
      return res.status(400).json({ message: "ID alamat wajib diisi." });
    }

    // Cari address milik user
    const address = await Addresses.findOne({
      where: {
        address_id: addressId,
        address_user: user.user_id,
      },
    });

    if (!address) {
      return res.status(404).json({ message: "Alamat tidak ditemukan." });
    }

    // Validasi: Jangan hapus alamat utama
    if (address.address_is_default) {
      return res.status(400).json({
        message: "Tidak dapat menghapus alamat utama. Jadikan alamat lain sebagai utama terlebih dahulu.",
      });
    }

    await address.destroy();

    return res.status(200).json({ message: "Alamat berhasil dihapus." });
  } catch (error) {
    console.error("Error in deleteAddress:", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

exports.setDefaultAddress = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    const { id: addressId } = req.params;

    if (!addressId) {
      await t.rollback();
      return res.status(400).json({ message: "ID alamat wajib diisi." });
    }

    const addressToSetDefault = await Addresses.findOne({
      where: {
        address_id: addressId,
        address_user: user.user_id,
      },
      transaction: t,
    });

    if (!addressToSetDefault) {
      await t.rollback();
      return res.status(404).json({ message: "Alamat tidak ditemukan." });
    }

    // 1. Hapus status default dari alamat lain
    await Addresses.update(
      { address_is_default: false },
      { where: { address_user: user.user_id }, transaction: t }
    );

    // 2. Atur alamat yang dipilih sebagai default
    addressToSetDefault.address_is_default = true;
    await addressToSetDefault.save({ transaction: t });

    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Alamat berhasil diatur sebagai default.",
    });
  } catch (error) {
    await t.rollback();
    console.error("Error in setDefaultAddress:", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};
