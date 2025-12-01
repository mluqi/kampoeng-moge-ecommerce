const { ApiLog } = require("../models");

const MAX_PAYLOAD_LENGTH = 1000; // Batas karakter untuk payload JSON sebelum di-encode

/**
 * Membuat catatan log interaksi API eksternal.
 * @param {object} logData - Data log yang akan disimpan.
 * @param {'JNE'|'TIKTOK_SHOP'} logData.serviceName - Nama layanan eksternal.
 * @param {string} logData.endpoint - Endpoint atau fungsi yang dipanggil.
 * @param {object|string} [logData.requestPayload] - Payload yang dikirim.
 * @param {object|string} [logData.responsePayload] - Payload yang diterima.
 * @param {'SUCCESS'|'FAILED'} logData.status - Status panggilan API.
 * @param {string} [logData.errorMessage] - Pesan error jika gagal.
 * @param {number} [logData.durationMs] - Durasi panggilan dalam milidetik.
 */
const createApiLog = async (logData) => {
  const {
    serviceName,
    endpoint,
    requestPayload,
    responsePayload,
    status,
    errorMessage,
    durationMs,
  } = logData;

  try {
    let requestBase64 = null;
    if (requestPayload) {
      const requestJson = JSON.stringify(requestPayload, null, 2);
      requestBase64 = Buffer.from(requestJson).toString("base64");
    }

    let responseBase64 = null;
    if (responsePayload) {
      let responseJson = JSON.stringify(responsePayload, null, 2);
      // Check if responsePayload is an object and has a 'data' field, and if that 'data' field is a string
      // This is a common pattern for TikTok Shop API responses, where 'data' can be a very long JSON string
      if (
        typeof responsePayload === "object" &&
        responsePayload !== null &&
        typeof responsePayload.data === "string" &&
        responsePayload.data.length > MAX_PAYLOAD_LENGTH
      ) {
        responseJson = JSON.stringify(
          {
            ...responsePayload,
            data:
              responsePayload.data.substring(0, MAX_PAYLOAD_LENGTH) +
              "... (truncated)",
          },
          null,
          2
        );
      } else if (responseJson.length > MAX_PAYLOAD_LENGTH) {
        responseJson =
          responseJson.substring(0, MAX_PAYLOAD_LENGTH) + "... (truncated)";
      }
      responseBase64 = Buffer.from(responseJson).toString("base64");
    }

    await ApiLog.create({
      service_name: serviceName,
      endpoint: endpoint,
      request_payload: requestBase64,
      response_payload: responseBase64,
      status: status,
      error_message: errorMessage || null,
      duration_ms: durationMs || null,
    });
  } catch (error) {
    console.error("Failed to create API log:", error);
  }
};

module.exports = { createApiLog };
