const ICONS = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 8h.01M11 12h1v5h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const STYLES = {
  success: 'bg-navy-900 text-white [&_.icn]:bg-teal-500/20 [&_.icn]:text-teal-400',
  error: 'bg-navy-900 text-white [&_.icn]:bg-coral-500/20 [&_.icn]:text-coral-400',
  info: 'bg-navy-900 text-white [&_.icn]:bg-navy-500/30 [&_.icn]:text-navy-200',
};

export default function ToastViewport({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`animate-popIn pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl px-4 py-3 shadow-card-hover ${STYLES[t.type] || STYLES.info}`}
        >
          <span className="icn mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full">
            {ICONS[t.type] || ICONS.info}
          </span>
          <p className="flex-1 text-sm leading-snug">{t.message}</p>
          <button
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss notification"
            className="ml-1 text-white/50 transition-colors hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
