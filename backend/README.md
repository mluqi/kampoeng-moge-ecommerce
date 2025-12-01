# Dokumentasi Backend Kampoeng Moge App

Dokumentasi ini memberikan gambaran umum tentang arsitektur dan fungsionalitas backend dari aplikasi Kampoeng Moge.

## Services

Services berisi logika bisnis yang terisolasi dan dapat digunakan kembali di seluruh aplikasi.

### `apiLogService.js`

Layanan ini bertanggung jawab untuk mencatat semua interaksi (request dan response) dengan API eksternal yang digunakan oleh aplikasi, seperti JNE, TikTok Shop, dll.

#### **`createApiLog(logData)`**

Fungsi ini digunakan untuk membuat entri log baru setiap kali aplikasi berinteraksi dengan API eksternal.

**Tujuan:**
- **Debugging:** Memudahkan pelacakan dan investigasi masalah saat berkomunikasi dengan layanan pihak ketiga.
- **Monitoring:** Memberikan data untuk memantau kesehatan dan performa integrasi API.

**Parameter:**

- `logData` (Object): Objek yang berisi detail dari interaksi API.
  - `serviceName` (String): Nama layanan eksternal yang dituju. Nilai yang diharapkan: `'JNE'`, `'TIKTOK_SHOP'`.
  - `endpoint` (String): Endpoint spesifik atau nama fungsi dari layanan yang dipanggil.
  - `requestPayload` (Object|String, Opsional): Payload yang dikirimkan dalam permintaan.
  - `responsePayload` (Object|String, Opsional): Payload yang diterima sebagai respons.
  - `status` (String): Status hasil panggilan API. Nilai yang diharapkan: `'SUCCESS'`, `'FAILED'`.
  - `errorMessage` (String, Opsional): Pesan kesalahan jika panggilan API gagal.
  - `durationMs` (Number, Opsional): Durasi panggilan API dalam milidetik.

**Contoh Penggunaan:**

```javascript
const { createApiLog } = require('./services/apiLogService');

async function someFunctionThatCallsExternalAPI() {
  const startTime = Date.now();
  try {
    // ... logika panggilan API ...
    const response = await externalApi.call();
    const durationMs = Date.now() - startTime;

    createApiLog({
      serviceName: 'TIKTOK_SHOP',
      endpoint: '/api/products/search',
      requestPayload: { query: 'sepatu' },
      responsePayload: response.data,
      status: 'SUCCESS',
      durationMs: durationMs
    });

  } catch (error) {
    const durationMs = Date.now() - startTime;
    createApiLog({
      serviceName: 'TIKTOK_SHOP',
      endpoint: '/api/products/search',
      requestPayload: { query: 'sepatu' },
      status: 'FAILED',
      errorMessage: error.message,
      durationMs: durationMs
    });
  }
}
```
