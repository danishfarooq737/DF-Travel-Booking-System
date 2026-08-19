// Signature visual motif: a dashed flight path between two points, echoed
// throughout the product (hero, step indicator, confirmation screen) to tie
// the "journey" concept together instead of generic decoration.
export default function RouteLine({ className = '', animated = true }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 100 C 100 100, 140 20, 220 20 S 340 90, 388 24"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="1 10"
        strokeLinecap="round"
        className={animated ? 'animate-dashMove' : ''}
      />
      <circle cx="12" cy="100" r="5" fill="currentColor" />
      <circle cx="388" cy="24" r="5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
