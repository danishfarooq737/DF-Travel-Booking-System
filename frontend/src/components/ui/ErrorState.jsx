export default function ErrorState({ message = 'Something went wrong. Please try again.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-coral-200 bg-coral-50 px-6 py-12 text-center animate-fadeUp">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-coral-100 text-coral-600">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="max-w-sm text-sm font-medium text-coral-800">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline mt-4 !border-coral-300 !text-coral-700 hover:!bg-coral-100">
          Try again
        </button>
      )}
    </div>
  );
}
