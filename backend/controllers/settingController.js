const { Setting } = require("../models");
const { createActivityLog } = require("../services/logService");

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
      return res.status(404).json({ message: "Setting tidak ditemukan." });
    }
    res.status(200).json(setting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  // Ambil data settings dari form-data (req.body.settings) atau langsung dari req.body
  let settingsToUpdate = req.body.settings || req.body;
  if (typeof settingsToUpdate === "string") {
    try {
      settingsToUpdate = JSON.parse(settingsToUpdate);
    } catch (e) {
      return res.status(400).json({ message: "Input tidak valid." });
    }
  }

  if (!Array.isArray(settingsToUpdate)) {
    return res.status(400).json({ message: "Input harus berupa array." });
  }

  try {
    const oldSettings = await Setting.findAll();
    const oldSettingsMap = oldSettings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    if (req.file) {
      const logoUrl = `/uploads/settings/${req.file.filename}`;
      await Setting.upsert({
        key: "logo_url",
        value: logoUrl,
        group: "footer",
      });
    }

    const newSettingsMap = {};
    for (const setting of settingsToUpdate) {
      const valueStr = String(setting.value);
      newSettingsMap[setting.key] = valueStr;
      await Setting.upsert({
        key: setting.key,
        value: valueStr,
        group: setting.group,
      });
    }

    const changes = {};
    const allKeys = new Set([
      ...Object.keys(oldSettingsMap),
      ...Object.keys(newSettingsMap),
    ]);

    for (const key of allKeys) {
      if (oldSettingsMap[key] !== newSettingsMap[key]) {
        changes[key] = {
          before: oldSettingsMap[key] || null,
          after: newSettingsMap[key] || null,
        };
      }
    }

    if (Object.keys(changes).length > 0) {
      await createActivityLog(
        req,
        req.user,
        "UPDATE",
        { type: "Setting", id: "bulk-update" },
        changes
      );
    }

    res.status(200).json({ message: "Pengaturan berhasil diperbarui." });
  } catch (error) {
    await createActivityLog(
      req,
      req.user,
      "UPDATE",
      { type: "Setting", id: "bulk-update" },
      { error: error.message, attemptedChanges: settingsToUpdate },
      "FAILED"
    );
    res.status(500).json({ message: error.message });
  }
};

// Controller untuk memperbarui service JNE yang ditampilkan
exports.updateActiveShippingServices = async (req, res) => {
  const { services } = req.body;
  try {
    const oldSetting = await Setting.findByPk("shipping_jne_active_services");
    const oldValue = oldSetting ? oldSetting.value : null;
    const newValue = JSON.stringify(services);

    await Setting.upsert({
      key: "shipping_jne_active_services",
      value: newValue,
      group: "shipping",
    });

    if (oldValue !== newValue) {
      await createActivityLog(
        req,
        req.user,
        "UPDATE",
        { type: "Setting", id: "shipping_jne_active_services" },
        { before: oldValue, after: newValue }
      );
    }

    res
      .status(200)
      .json({ message: "Layanan pengiriman JNE berhasil diperbarui." });
  } catch (error) {
    console.error("Error updating active shipping services:", error);
    await createActivityLog(
      req,
      req.user,
      "UPDATE",
      { type: "Setting", id: "shipping_jne_active_services" },
      { error: error.message, attemptedChange: { services } },
      "FAILED"
    );
    res
      .status(500)
      .json({ message: "Gagal memperbarui layanan pengiriman JNE." });
  }
};

exports.updateCategoryColour = async (req, res) => {
  const { colour } = req.body;
  try {
    const oldSetting = await Setting.findByPk("category_colour");
    const oldValue = oldSetting ? oldSetting.value : null;

    await Setting.upsert({
      key: "category_colour",
      value: colour,
      group: "category",
    });

    if (oldValue !== colour) {
      await createActivityLog(
        req,
        req.user,
        "UPDATE",
        { type: "Setting", id: "category_colour" },
        { before: oldValue, after: colour }
      );
    }
    res.status(200).json({ message: "Warna kategori berhasil diperbarui." });
  } catch (error) {
    console.error("Error updating category colour:", error);
    await createActivityLog(
      req,
      req.user,
      "UPDATE",
      { type: "Setting", id: "category_colour" },
      { error: error.message, attemptedChange: { colour } },
      "FAILED"
    );
    res.status(500).json({ message: "Gagal memperbarui warna kategori." });
  }
};
