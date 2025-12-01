require("dotenv").config();
const axios = require("axios");

const { createApiLog } = require("./apiLogService");

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
  const startTime = Date.now();
  try {
    const response = await xenditClient.post("/v2/invoices", data);
    await createApiLog({
      serviceName: "XENDIT",
      endpoint: "/v2/invoices",
      requestPayload: data,
      responsePayload: response.data,
      status: "SUCCESS",
      durationMs: Date.now() - startTime,
    });
    return response.data;
  } catch (error) {
    const responsePayload = error.response?.data || { message: error.message };
    await createApiLog({
      serviceName: "XENDIT",
      endpoint: "/v2/invoices",
      requestPayload: data,
      responsePayload: responsePayload,
      status: "FAILED",
      errorMessage: error.message,
      durationMs: Date.now() - startTime,
    });
    console.error("Error creating invoice:", error);
    // Throw the structured error payload
    throw responsePayload;
  }
};

/**
 * Get invoice by ID
 * @param {string} invoiceId - Xendit invoice ID
 * @returns {Promise<Object>} Invoice data
 */
const getInvoiceById = async (invoiceId) => {
  const startTime = Date.now();
  try {
    const response = await xenditClient.get(`/v2/invoices/${invoiceId}`);
    await createApiLog({
      serviceName: "XENDIT",
      endpoint: `/v2/invoices/${invoiceId}`,
      requestPayload: { invoiceId },
      responsePayload: response.data,
      status: "SUCCESS",
      durationMs: Date.now() - startTime,
    });
    return response.data;
  } catch (error) {
    const responsePayload = error.response?.data || { message: error.message };
    await createApiLog({
      serviceName: "XENDIT",
      endpoint: `/v2/invoices/${invoiceId}`,
      requestPayload: { invoiceId },
      responsePayload: responsePayload,
      status: "FAILED",
      errorMessage: error.message,
      durationMs: Date.now() - startTime,
    });
    // Throw the structured error payload
    throw responsePayload;
  }
};

/**
 * Get all invoices (optional: with query params like limit, statuses, etc.)
 * @param {Object} queryParams - e.g. { limit: 5, statuses: 'PAID,PENDING' }
 * @returns {Promise<Object>} List of invoices
 */
const getAllInvoices = async (queryParams = {}) => {
  const startTime = Date.now();
  try {
    const response = await xenditClient.get("/v2/invoices", {
      params: queryParams,
    });
    await createApiLog({
      serviceName: "XENDIT",
      endpoint: "/v2/invoices",
      requestPayload: { queryParams },
      responsePayload: response.data,
      status: "SUCCESS",
      durationMs: Date.now() - startTime,
    });
    return response.data;
  } catch (error) {
    const responsePayload = error.response?.data || { message: error.message };
    await createApiLog({
      serviceName: "XENDIT",
      endpoint: "/v2/invoices",
      requestPayload: { queryParams },
      responsePayload: responsePayload,
      status: "FAILED",
      errorMessage: error.message,
      durationMs: Date.now() - startTime,
    });
    throw responsePayload;
  }
};

module.exports = {
  createInvoice,
  getInvoiceById,
  getAllInvoices,
};
