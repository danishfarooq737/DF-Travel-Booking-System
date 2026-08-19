export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy-200 bg-white/60 px-6 py-14 text-center animate-fadeUp">
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy-50 text-navy-400">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-navy-800">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-navy-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
