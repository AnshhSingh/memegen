export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/50 to-gray-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-black text-gray-900 dark:text-white p-8 animate-pulse">
      <div className="text-center space-y-4">
        <div className="flex justify-center items-center">
          <svg
            className="animate-spin h-8 w-8 text-purple-600 dark:text-purple-400"
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
        </div>
        <p className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-700 dark:from-purple-400 dark:to-pink-500">
          Loading your masterpiece...
        </p>
      </div>
    </div>
  );
} 