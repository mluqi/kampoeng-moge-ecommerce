const { Setting } = require("../models");

// Mengambil semua pengaturan, dikelompokkan
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await Setting.findAll();
    // Kelompokkan pengaturan berdasarkan 'group' untuk memudahkan frontend
    const groupedSettings = settings.reduce((acc, setting) => {
      const { group, key, value } = setting;
      if (!acc[group]) {
        acc[group] = {};
      }
      try {
        // Coba parse jika value-nya JSON (misal: untuk daftar layanan kurir)
        acc[group][key] = JSON.parse(value);
      } catch (e) {
        acc[group][key] = value;
      }
      return acc;
    }, {});
    res.status(200).json(groupedSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mendapatkan pengaturan berdasarkan key
exports.getSettingByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Setting.findByPk(key);

    if (!setting) {
      return res.status(404).json({ message: 'Setting tidak ditemukan.' });
    }
    res.status(200).json(setting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Memperbarui beberapa pengaturan sekaligus
exports.updateSettings = async (req, res) => {
  // Body request diharapkan berupa array: [{ key: 'store_name', value: 'Toko Baru' }, ...]
  const settingsToUpdate = req.body;
  if (!Array.isArray(settingsToUpdate)) {
    return res.status(400).json({ message: "Input harus berupa array." });
  }

  try {
    for (const setting of settingsToUpdate) {
      await Setting.upsert({
        key: setting.key,
        value: String(setting.value), // Pastikan value selalu string
        group: setting.group,
      });
    }
    res.status(200).json({ message: "Pengaturan berhasil diperbarui." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller untuk memperbarui service JNE yang ditampilkan
exports.updateActiveShippingServices = async (req, res) => {
  try {
    const { services } = req.body;

    await Setting.upsert({
      key: "shipping_jne_active_services",
      value: JSON.stringify(services),
      group: "shipping",
    });

    res.status(200).json({ message: "Layanan pengiriman JNE berhasil diperbarui." });
  } catch (error) {
    console.error("Error updating active shipping services:", error);
    res.status(500).json({ message: "Gagal memperbarui layanan pengiriman JNE." });
  }
};
