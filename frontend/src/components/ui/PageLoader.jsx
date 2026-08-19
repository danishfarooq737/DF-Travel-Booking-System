import Spinner from './Spinner.jsx';

export default function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-navy-400">
      <Spinner size={28} />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
