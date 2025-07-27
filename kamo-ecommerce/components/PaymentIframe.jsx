import PropTypes from 'prop-types';

const PaymentIframe = ({
  paymentUrl,
  paymentMethod,
  amount,
  currency = 'IDR',
  loadingText = 'Memuat halaman pembayaran...',
  timeout = 30000,
  onLoad,
  onTimeout,
  onClose,
  className = '',
}) => {
  const formatCurrency = (value) => {
    if (currency === 'IDR') {
      return `Rp ${value.toLocaleString('id-ID')}`;
    }
    return `${currency} ${value.toLocaleString()}`;
  };

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
      <div className="p-6 md:p-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            Selesaikan Pembayaran
          </h2>
          <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-blue-600">
              Menunggu Pembayaran
            </span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-gray-500">Metode Pembayaran</p>
              <p className="font-medium text-gray-800">{paymentMethod}</p>
            </div>
            <div className="mt-2 md:mt-0">
              <p className="text-sm text-gray-500">Total Pembayaran</p>
              <p className="font-bold text-lg text-gray-800">
                {formatCurrency(amount)}
              </p>
            </div>
          </div>
        </div>

        {/* Iframe Container */}
        <div className="border-2 border-gray-200 rounded-xl overflow-hidden relative min-h-[500px]">
          {paymentUrl ? (
            <iframe
              src={paymentUrl}
              title="Payment Gateway"
              width="100%"
              height="600"
              frameBorder="0"
              allowFullScreen
              className="min-h-[500px]"
              onLoad={onLoad}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-500">{loadingText}</p>
            </div>
          )}
        </div>

        {/* Warning Message */}
        {/* <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Jangan tutup halaman ini selama proses pembayaran. Setelah
                pembayaran berhasil, Anda akan diarahkan ke halaman konfirmasi
                otomatis.
              </p>
            </div>
          </div>
        </div> */}

        {/* Footer Actions */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center text-gray-600 hover:text-gray-800 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Kembali
          </button>
          <p className="text-sm text-gray-500 text-center">
            Butuh bantuan?{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Hubungi kami
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

PaymentIframe.propTypes = {
  paymentUrl: PropTypes.string,
  paymentMethod: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
  currency: PropTypes.string,
  loadingText: PropTypes.string,
  timeout: PropTypes.number,
  onLoad: PropTypes.func,
  onTimeout: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default PaymentIframe;