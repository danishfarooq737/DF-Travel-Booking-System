const STEPS = ['Trip', 'Passengers', 'Payment', 'Confirmation'];

export default function StepIndicator({ current }) {
  return (
    <ol className="mb-8 flex items-center justify-between gap-2">
      {STEPS.map((step, i) => {
        const index = i + 1;
        const done = index < current;
        const active = index === current;
        return (
          <li key={step} className="flex flex-1 items-center last:flex-initial">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-300 ${
                  done
                    ? 'bg-teal-500 text-white'
                    : active
                    ? 'bg-coral-500 text-white'
                    : 'bg-navy-100 text-navy-400'
                }`}
              >
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  index
                )}
              </span>
              <span className={`text-xs font-medium ${active ? 'text-navy-900' : 'text-navy-400'}`}>{step}</span>
            </div>
            {index < STEPS.length && (
              <div className={`mx-2 h-0.5 flex-1 rounded-full transition-colors duration-300 ${done ? 'bg-teal-500' : 'bg-navy-100'}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
