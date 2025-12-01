const { ActivityLog } = require("../models");
const { getClientIp } = require("../utils/requestUtils");

/**
 * Membuat catatan log aktivitas admin.
 * @param {object} req - Objek request dari Express untuk mendapatkan IP dan User Agent.
 * @param {object} admin - Objek admin yang melakukan aksi (misal: dari req.user).
 * @param {string} actionType - Tipe aksi (CREATE, UPDATE, DELETE, dll).
 * @param {object} entity - Objek yang berisi tipe dan ID entitas.
 * @param {string} entity.type - Tipe entitas (e.g., 'Product', 'Order').
 * @param {string|number} entity.id - ID dari entitas.
 * @param {object|string} [details] - Detail tambahan, seperti data sebelum dan sesudah perubahan.
 * @param {string} [status='SUCCESS'] - Status aksi ('SUCCESS' atau 'FAILED').
 */
const createActivityLog = async (
  req,
  admin,
  actionType,
  entity,
  details = null,
  status = "SUCCESS"
) => {
  try {
    let detailsToStore = null;
    // Hanya simpan jika 'details' adalah objek dan memiliki isi
    if (
      details &&
      typeof details === "object" &&
      Object.keys(details).length > 0
    ) {
      // Ubah objek detail menjadi string JSON yang rapi
      const jsonString = JSON.stringify(details, null, 2);
      // Encode string JSON ke Base64
      detailsToStore = Buffer.from(jsonString).toString("base64");
    }

    await ActivityLog.create({
      admin_id: admin.id,
      admin_name: admin.name,
      action_type: actionType,
      entity_type: entity.type,
      entity_id: String(entity.id), // Pastikan ID selalu string
      details: detailsToStore, // Simpan query yang sudah di-encode
      ip_address: getClientIp(req),
      user_agent: req.headers["user-agent"],
      status: status,
    });
  } catch (error) {
    console.error("Failed to create activity log:", error);
  }
};

module.exports = { createActivityLog };
