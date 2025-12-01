
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  confirmButtonClass = "bg-red-600 hover:bg-red-700",
  isConfirming = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all duration-300 scale-95 sm:scale-100">
        <h2 className="text-xl font-bold mb-4 text-gray-900">{title}</h2>
        <p className="mb-6 text-gray-600">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isConfirming}
            className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isConfirming}
            className={`px-4 py-2 rounded text-white transition-colors flex items-center justify-center ${confirmButtonClass} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isConfirming ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Memproses...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
