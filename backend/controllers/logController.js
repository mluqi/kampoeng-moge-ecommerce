const { ActivityLog, AccessLog, ApiLog, admin_akses } = require("../models");
const { Op } = require("sequelize");

// Mengambil log aktivitas (CUD)
exports.getActivityLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      action_type,
      admin_id,
      startDate,
      endDate,
      entity_type,
    } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    let whereClause = {};
    if (action_type) whereClause.action_type = action_type;
    if (admin_id) whereClause.admin_id = admin_id;
    if (entity_type) whereClause.entity_type = entity_type;
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const { count, rows } = await ActivityLog.findAndCountAll({
      where: whereClause,
      include: [
        { model: admin_akses, as: "admin", attributes: ["name", "email"] },
      ],
      limit: limitNum,
      offset: offset,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      data: rows,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      totalLogs: count,
    });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Mengambil log akses (login)
exports.getAccessLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, startDate, endDate } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    let whereClause = {};
    if (status) whereClause.status = status;
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const { count, rows } = await AccessLog.findAndCountAll({
      where: whereClause,
      limit: limitNum,
      offset: offset,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      data: rows,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      totalLogs: count,
    });
  } catch (error) {
    console.error("Error fetching access logs:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Mengambil log API
exports.getApiLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      service_name,
      status,
      startDate,
      endDate,
    } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    let whereClause = {};
    if (service_name) whereClause.service_name = service_name;
    if (status) whereClause.status = status;
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const { count, rows } = await ApiLog.findAndCountAll({
      where: whereClause,
      limit: limitNum,
      offset: offset,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      data: rows,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      totalLogs: count,
    });
  } catch (error) {
    console.error("Error fetching API logs:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Mengambil daftar admin untuk dropdown filter
exports.getAdminsForFilter = async (req, res) => {
  try {
    const admins = await admin_akses.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });
    res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching admins for filter:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
