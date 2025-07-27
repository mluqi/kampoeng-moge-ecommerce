require("dotenv").config();
const axios = require("axios");

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;
const XENDIT_API_URL = "https://api.xendit.co";

const xenditClient = axios.create({
  baseURL: XENDIT_API_URL,
  auth: {
    username: XENDIT_SECRET_KEY,
    password: "",
  },
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Create invoice
 * @param {Object} data - Invoice payload (external_id, amount, payer_email, description, etc.)
 * @returns {Promise<Object>} Xendit invoice response
 */

const createInvoice = async (data) => {
  try {
    const response = await xenditClient.post("/v2/invoices", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get invoice by ID
 * @param {string} invoiceId - Xendit invoice ID
 * @returns {Promise<Object>} Invoice data
 */
const getInvoiceById = async (invoiceId) => {
  try {
    const response = await xenditClient.get(`/v2/invoices/${invoiceId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get all invoices (optional: with query params like limit, statuses, etc.)
 * @param {Object} queryParams - e.g. { limit: 5, statuses: 'PAID,PENDING' }
 * @returns {Promise<Object>} List of invoices
 */
const getAllInvoices = async (queryParams = {}) => {
  try {
    const response = await xenditClient.get("/v2/invoices", {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};



module.exports = {
  createInvoice,
  getInvoiceById,
  getAllInvoices,
};
