require("dotenv").config();
const axios = require("axios");
const qs = require("qs");

const JNE_API_URL = "https://apiv2.jne.co.id:10205/tracing/api";
const JNE_USERNAME = process.env.JNE_USERNAME;
const JNE_API_KEY = process.env.JNE_API_KEY;
const JNE_OLSHOP_BRANCH = process.env.JNE_OLSHOP_BRANCH;
const JNE_OLSHOP_CUST = process.env.JNE_OLSHOP_CUST;
const JNE_SHIPPER_NAME = process.env.JNE_SHIPPER_NAME;
const JNE_SHIPPER_ADDR1 = process.env.JNE_SHIPPER_ADDR1;
const JNE_SHIPPER_ADDR2 = process.env.JNE_SHIPPER_ADDR2;
const JNE_SHIPPER_ADDR3 = process.env.JNE_SHIPPER_ADDR3;
const JNE_SHIPPER_CITY = process.env.JNE_SHIPPER_CITY;
const JNE_SHIPPER_REGION = process.env.JNE_SHIPPER_REGION;
const JNE_SHIPPER_ZIP = process.env.JNE_SHIPPER_ZIP;
const JNE_SHIPPER_PHONE = process.env.JNE_SHIPPER_PHONE;
const JNE_ORIGIN_CODE = process.env.JNE_ORIGIN_CODE;

const jneInstance = axios.create({
  baseURL: JNE_API_URL,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
    "User-Agent": "KampoengMoge-App/1.0",
  },
});

/**
 * Get JNE shipping price.
 * @param {object} params - The parameters for the price check.
 * @param {string} params.from - Origin tariff code.
 * @param {string} params.thru - Destination tariff code.
 * @param {number} params.weight - Weight in kilograms.
 * @returns {Promise<object>} JNE API response.
 */
const getJnePrice = async ({ from, thru, weight }) => {
  if (!JNE_USERNAME || !JNE_API_KEY) {
    throw new Error("JNE_USERNAME and JNE_API_KEY must be set in .env file");
  }

  try {
    const payload = {
      username: JNE_USERNAME,
      api_key: JNE_API_KEY,
      from,
      thru,
      weight,
    };

    const response = await jneInstance.post("/pricedev", qs.stringify(payload));

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "JNE API Axios Error:",
        error.response?.data || error.message
      );
      throw (
        error.response?.data ||
        new Error("Failed to get JNE shipping price due to a network error.")
      );
    }
    console.error("JNE API Generic Error:", error);
    throw new Error("Failed to get JNE shipping price.");
  }
};

/**
 * Generate JNE Airway Bill (AWB/CNote).
 * @param {object} data - The data for generating the AWB.
 * @returns {Promise<object>} JNE API response with cnote_no.
 */
const generateAirwayBill = async (data) => {
  if (
    !JNE_USERNAME ||
    !JNE_API_KEY ||
    !JNE_OLSHOP_BRANCH ||
    !JNE_OLSHOP_CUST ||
    !JNE_SHIPPER_NAME ||
    !JNE_SHIPPER_ADDR1 ||
    !JNE_SHIPPER_CITY ||
    !JNE_SHIPPER_ZIP ||
    !JNE_SHIPPER_PHONE ||
    !JNE_ORIGIN_CODE
  ) {
    throw new Error("Incomplete JNE shipper details in .env file");
  }

  try {
    const payload = {
      username: JNE_USERNAME,
      api_key: JNE_API_KEY,
      OLSHOP_BRANCH: JNE_OLSHOP_BRANCH,
      OLSHOP_CUST: JNE_OLSHOP_CUST,
      OLSHOP_ORDERID: data.orderId,
      OLSHOP_SHIPPER_NAME: JNE_SHIPPER_NAME,
      OLSHOP_SHIPPER_ADDR1: JNE_SHIPPER_ADDR1,
      OLSHOP_SHIPPER_ADDR2: JNE_SHIPPER_ADDR2 || "",
      OLSHOP_SHIPPER_ADDR3: JNE_SHIPPER_ADDR3 || "",
      OLSHOP_SHIPPER_CITY: JNE_SHIPPER_CITY,
      OLSHOP_SHIPPER_REGION: JNE_SHIPPER_REGION || "",
      OLSHOP_SHIPPER_ZIP: JNE_SHIPPER_ZIP,
      OLSHOP_SHIPPER_PHONE: JNE_SHIPPER_PHONE,
      OLSHOP_RECEIVER_NAME: data.receiverName,
      OLSHOP_RECEIVER_ADDR1: data.receiverAddr1,
      OLSHOP_RECEIVER_ADDR2: data.receiverAddr2 || "",
      OLSHOP_RECEIVER_ADDR3: data.receiverAddr3 || "",
      OLSHOP_RECEIVER_CITY: data.receiverCity,
      OLSHOP_RECEIVER_REGION: data.receiverRegion || "",
      OLSHOP_RECEIVER_ZIP: data.receiverZip,
      OLSHOP_RECEIVER_PHONE: data.receiverPhone,
      OLSHOP_QTY: data.quantity,
      OLSHOP_WEIGHT: data.weight,
      OLSHOP_GOODSDESC: data.goodsDescription,
      OLSHOP_GOODSVALUE: data.goodsValue,
      OLSHOP_GOODSTYPE: "2", // Default as per docs
      OLSHOP_INST: data.instruction || "",
      OLSHOP_INS_FLAG: data.useInsurance ? "Y" : "N",
      OLSHOP_ORIG: JNE_ORIGIN_CODE,
      OLSHOP_DEST: data.destinationCode,
      OLSHOP_SERVICE: data.serviceCode,
      OLSHOP_COD_FLAG: data.useCOD ? "YES" : "N",
      OLSHOP_COD_AMOUNT: data.codAmount || 0,
    };

    // The endpoint for generating AWB is usually different from pricing.
    // Assuming '/generatecnote' based on common patterns. This might need adjustment.
    const response = await jneInstance.post(
      "/generatecnote",
      qs.stringify(payload)
    );
    console.log("JNE AWB Generation Response:", response);

    // Check for success status in the response body
    if (response.data?.detail?.[0]?.status?.toLowerCase() === "sukses") {
      return response.data;
    } else {
      // Throw an error if the API indicates failure
      const errorMessage =
        response.data?.detail?.[0]?.cnote_no ||
        "Failed to generate AWB from JNE.";
      throw new Error(errorMessage);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "JNE AWB API Axios Error:",
        error.response?.data || error.message
      );
      throw (
        error.response?.data ||
        new Error("Failed to generate JNE AWB due to a network error.")
      );
    }
    console.error("JNE AWB API Generic Error:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to generate JNE AWB.");
  }
};

/**
 * Track JNE shipment.
 * @param {string} trackingNumber - The AWB/CNote number.
 * @returns {Promise<object>} JNE API tracking response.
 */
const trackingOrder = async (trackingNumber) => {
  if (!JNE_USERNAME || !JNE_API_KEY) {
    throw new Error("JNE_USERNAME and JNE_API_KEY must be set in .env file");
  }

  try {
    const payload = {
      username: JNE_USERNAME,
      api_key: JNE_API_KEY,
    };

    // The endpoint for tracking is /list/v1/cnote/[cnote]
    const response = await jneInstance.post(
      `/list/v1/cnote/${trackingNumber}`,
      qs.stringify(payload)
    );

    // Assuming a successful response has a 'cnote' or 'detail' object.
    if (response.data && (response.data.cnote || response.data.detail)) {
      return response.data;
    } else {
      // JNE might return an error message in a different structure
      const errorMessage =
        response.data?.detail?.[0]?.status || response.data?.error;
      throw new Error(errorMessage);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "JNE Tracking API Axios Error:",
        error.response?.data || error.message
      );
      throw (
        error.response?.data ||
        new Error("Failed to track JNE shipment due to a network error.")
      );
    }
    console.error("JNE Tracking API Generic Error:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to track JNE shipment.");
  }
};

module.exports = { getJnePrice, generateAirwayBill, trackingOrder };
