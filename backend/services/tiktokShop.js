require("dotenv").config();
const axios = require("axios");
const qs = require("qs");
const crypto = require("crypto");
const FormData = require("form-data");

const { integration_tokens: TiktokToken } = require("../models");

const {
  TIKPED_APP_KEY: APP_KEY,
  TIKPED_APP_SECRET: APP_SECRET,
  TIKPED_SHOP_CIPHER: SHOP_CIPHER,
  // TIKPED_ACCESS_TOKEN: ACCESS_TOKEN,
  TIKPED_WAREHOUSE_ID: WAREHOUSE_ID,
} = process.env;

if (!APP_KEY || !APP_SECRET || !SHOP_CIPHER || !WAREHOUSE_ID) {
  throw new Error(
    "Environment variables are not fully configured. Please check your .env file."
  );
}

const API_URL = "https://open-api.tiktokglobalshop.com";
const AUTH_URL = "https://auth.tiktok-shops.com";

const tiktokInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Refreshes the TikTok Shop access token using the refresh token from the database.
 * @returns {Promise<string>} The new access token.
 */
const refreshToken = async () => {
  console.log("[TikTok Auth] Attempting to refresh access token...");
  try {
    const tokenRecord = await TiktokToken.findOne({
      where: { shop_cipher: SHOP_CIPHER },
    });

    if (!tokenRecord || !tokenRecord.refresh_token) {
      throw new Error("Refresh token not found in database for this shop.");
    }

    const authUrl = new URL("/api/v2/token/refresh", AUTH_URL);
    authUrl.search = qs.stringify({
      app_key: APP_KEY,
      app_secret: APP_SECRET,
      refresh_token: tokenRecord.refresh_token,
      grant_type: "refresh_token",
    });

    const response = await axios.get(authUrl.toString());

    if (response.data.code !== 0) {
      throw new Error(
        `TikTok token refresh failed: ${response.data.message} (Code: ${response.data.code})`
      );
    }

    const {
      access_token,
      refresh_token,
      access_token_expire_in,
      refresh_token_expire_in,
    } = response.data.data;

    // Simpan token baru ke database
    tokenRecord.access_token = access_token;
    tokenRecord.refresh_token = refresh_token;
    tokenRecord.expires_at = (access_token_expire_in - 300) * 1000; // Konversi ke ms & buffer 5 menit
    tokenRecord.refresh_expires_at = (refresh_token_expire_in - 86400) * 1000; // Konversi ke ms & buffer 1 hari
    await tokenRecord.save();

    console.log(
      "[TikTok Auth] ✅ Access token refreshed and saved successfully."
    );
    return access_token;
  } catch (error) {
    console.error("[TikTok Auth] ❌ Failed to refresh token:", error.message);
    if (error.response) {
      console.error("TikTok API Error Body:", error.response.data);
    }
    throw error;
  }
};

/**
 * Retrieves a valid access token from the database, refreshing it if necessary.
 * @returns {Promise<string>} A valid access token.
 */
const getValidAccessToken = async () => {
  const tokenRecord = await TiktokToken.findOne({
    where: { shop_id: SHOP_CIPHER },
  });

  if (!tokenRecord) {
    throw new Error(
      "No TikTok token record found in the database. Please save the initial token first via the /api/tiktok/save-token endpoint."
    );
  }

  const now = Date.now();
  const expiresAt = tokenRecord.expires_at;

  if (now >= expiresAt) {
    console.log("[TikTok Auth] Token is expired. Refreshing...");
    return refreshToken();
  }

  return tokenRecord.access_token;
};

/**
 * Generate TikTok Shop signature
 */
const generateSign = (url, params, body, contentType, appSecret) => {
  const excludeKeys = ["access_token", "sign"];
  const sortedParams = Object.keys(params || {})
    .filter((key) => !excludeKeys.includes(key))
    .sort()
    .map((key) => `${key}${params[key]}`)
    .join("");

  const pathname = new URL(url, API_URL).pathname;

  let signString = `${pathname}${sortedParams}`;

  if (
    contentType !== "multipart/form-data" &&
    body &&
    Object.keys(body).length
  ) {
    signString += JSON.stringify(body);
  }

  signString = `${appSecret}${signString}${appSecret}`;

  return crypto
    .createHmac("sha256", appSecret)
    .update(signString)
    .digest("hex");
};

/**
 * Generic POST caller for TikTok API with signature generation
 */
const postToTiktok = async (path, body = {}) => {
  const accessToken = await getValidAccessToken();
  const timestamp = Math.floor(Date.now() / 1000);
  const fullUrl = `${API_URL}${path}`;

  const contentType = "application/json";

  const params = {
    app_key: APP_KEY,
    timestamp,
    shop_cipher: SHOP_CIPHER,
  };

  const sign = generateSign(fullUrl, params, body, contentType, APP_SECRET);
  const finalParams = { ...params, sign };
  const finalUrl = `${path}?${qs.stringify(finalParams)}`;

  try {
    const response = await tiktokInstance.post(finalUrl, body, {
      headers: {
        "x-tts-access-token": accessToken,
        "Content-Type": contentType,
      },
    });

    console.log(`[TikTok API] ✅ Success POST ${path}`);
    return response.data;
  } catch (err) {
    const errorData = err.response?.data || err.message;
    console.error(`[TikTok API] ❌ Error POST ${path}:`, errorData);
    throw errorData;
  }
};

/**
 * Uploads an image to TikTok Shop.
 * @param {Buffer} imageBuffer - The image data as a buffer.
 * @param {string} [useCase="MAIN_IMAGE"] - The use case for the image (e.g., "MAIN_IMAGE", "SKU_IMAGE").
 * @returns {Promise<Object>} TikTok API response.
 */
const uploadImage = async (imageBuffer, useCase = "MAIN_IMAGE") => {
  const accessToken = await getValidAccessToken();
  const path = "/product/202309/images/upload";
  const timestamp = Math.floor(Date.now() / 1000);
  const fullUrl = `${API_URL}${path}`;
  const contentType = "multipart/form-data";

  const params = {
    app_key: APP_KEY,
    timestamp,
  };

  // For multipart/form-data, the body is not included in the signature calculation.
  const sign = generateSign(fullUrl, params, null, contentType, APP_SECRET);
  const finalParams = { ...params, sign };
  const finalUrl = `${path}?${qs.stringify(finalParams)}`;

  const form = new FormData();
  form.append("data", imageBuffer, {
    filename: "product.jpg",
    contentType: "image/jpeg",
  });
  form.append("use_case", useCase);

  try {
    const response = await tiktokInstance.post(finalUrl, form, {
      headers: {
        ...form.getHeaders(),
        "x-tts-access-token": accessToken,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    console.log(`[TikTok API] ✅ Success POST ${path}`);
    return response.data;
  } catch (err) {
    const errorData = err.response?.data || err.message;
    console.error(`[TikTok API] ❌ Error POST ${path}:`, errorData);
    throw errorData;
  }
};

/**
 * Creates a product on TikTok Shop
 */
const createProduct = async (productData) => {
  const path = "/product/202309/products";
  return postToTiktok(path, productData);
};

/**
 * Generic PUT caller for TikTok API with signature generation
 */
const putToTiktok = async (path, body = {}) => {
  const accessToken = await getValidAccessToken();
  const timestamp = Math.floor(Date.now() / 1000);
  const fullUrl = `${API_URL}${path}`;
  const contentType = "application/json";

  const params = {
    app_key: APP_KEY,
    timestamp,
    shop_cipher: SHOP_CIPHER,
  };

  const sign = generateSign(fullUrl, params, body, contentType, APP_SECRET);
  const finalParams = { ...params, sign };
  const finalUrl = `${path}?${qs.stringify(finalParams)}`;

  try {
    const response = await tiktokInstance.put(finalUrl, body, {
      headers: {
        "x-tts-access-token": accessToken,
        "Content-Type": contentType,
      },
    });

    console.log(`[TikTok API] ✅ Success PUT ${path}`);
    return response.data;
  } catch (err) {
    const errorData = err.response?.data || err.message;
    console.error(`[TikTok API] ❌ Error PUT ${path}:`, errorData);
    throw errorData;
  }
};

/**
 * Generic GET caller for TikTok API with signature generation
 */
const getFromTiktok = async (path, queryParams = {}) => {
  const accessToken = await getValidAccessToken();
  const timestamp = Math.floor(Date.now() / 1000);
  const fullUrl = `${API_URL}${path}`;

  const params = {
    app_key: APP_KEY,
    timestamp,
    shop_cipher: SHOP_CIPHER,
    ...queryParams,
  };

  // The body is null for GET requests
  const sign = generateSign(
    fullUrl,
    params,
    null,
    "application/json",
    APP_SECRET
  );
  const finalParams = { ...params, sign };
  const finalUrl = `${path}?${qs.stringify(finalParams)}`;

  try {
    const response = await tiktokInstance.get(finalUrl, {
      headers: {
        "x-tts-access-token": accessToken,
      },
    });

    console.log(`[TikTok API] ✅ Success GET ${path}`);
    return response.data;
  } catch (err) {
    const errorData = err.response?.data || err.message;
    console.error(`[TikTok API] ❌ Error GET ${path}:`, errorData);
    throw errorData;
  }
};

/**
 * Updates a product on TikTok Shop.
 * @param {string} productId - The ID of the product to update.
 * @param {object} productData - The product data to update.
 * @returns {Promise<Object>} TikTok API response.
 */
const updateProduct = async (productId, productData) => {
  const path = `/product/202309/products/${productId}`;
  return putToTiktok(path, productData);
};

/**
 * Partially updates a product on TikTok Shop.
 * @param {string} productId - The ID of the product to update.
 * @param {object} productData - The partial product data to update (e.g., only stock).
 * @returns {Promise<Object>} TikTok API response.
 */
const partialUpdateProduct = async (productId, productData) => {
  const path = `/product/202309/products/${productId}/partial_edit`;
  return postToTiktok(path, productData);
};

/**
 * Updates the inventory for specific SKUs of a product on TikTok Shop.
 * @param {string} productId - The TikTok product ID.
 * @param {Array<Object>} skus - An array of SKU objects with new inventory data.
 * @returns {Promise<Object>} TikTok API response.
 */
const updateInventory = async (productId, skus) => {
  const path = `/product/202309/products/${productId}/inventory/update`;
  const body = { skus };
  return postToTiktok(path, body);
};

/**
 * Gets details for a single product from TikTok Shop.
 * @param {string} productId - The TikTok product ID.
 * @returns {Promise<Object>} TikTok API response.
 */
const getSingleProductDetails = async (productId) => {
  const path = `/product/202309/products/${productId}`;
  return getFromTiktok(path);
};

/**
 * Activates products on TikTok Shop.
 * @param {string[]} productIds - An array of TikTok product IDs.
 * @returns {Promise<Object>} TikTok API response.
 */
const activateProduct = async (productIds) => {
  const path = "/product/202309/products/activate";
  const body = { product_ids: productIds };
  return postToTiktok(path, body);
};

/**
 * Deactivates products on TikTok Shop.
 * @param {string[]} productIds - An array of TikTok product IDs.
 * @returns {Promise<Object>} TikTok API response.
 */
const deactivateProduct = async (productIds) => {
  const path = "/product/202309/products/deactivate";
  const body = { product_ids: productIds };
  return postToTiktok(path, body);
};

/**
 * Gets categories from TikTok Shop.
 * @param {object} [options] - Optional parameters like keyword, locale.
 * @returns {Promise<Object>} TikTok API response.
 */
const getCategories = async (options = {}) => {
  const path = "/product/202309/categories";
  const queryParams = {
    version: "202309",
    locale: "id-ID",
    ...options,
  };
  const response = await getFromTiktok(path, queryParams);

  if (response && response.data && Array.isArray(response.data.categories)) {
    const leafCategories = response.data.categories.filter(
      (category) =>
        category.is_leaf === true &&
        category.permission_statuses.includes("AVAILABLE")
    );

    return {
      ...response,
      data: { ...response.data, categories: leafCategories },
    };
  }

  return response;
};

/**
 * Gets attributes for a specific category from TikTok Shop.
 * @param {string} categoryId - The ID of the category.
 * @param {object} [options] - Optional parameters like locale.
 * @returns {Promise<Object>} TikTok API response.
 */
const getCategoryAttributes = async (categoryId, options = {}) => {
  const path = `/product/202309/categories/${categoryId}/attributes`;
  const queryParams = {
    version: "202309",
    locale: "id-ID", // Default to Indonesian
    ...options,
  };
  return getFromTiktok(path, queryParams);
};

module.exports = {
  createProduct,
  uploadImage,
  updateProduct,
  updateInventory,
  partialUpdateProduct,
  postToTiktok,
  putToTiktok,
  getCategories,
  getCategoryAttributes,
  activateProduct,
  deactivateProduct,
  getSingleProductDetails,
  refreshToken,
};
