export default function PassengerRow({ index, passenger, onChange, onRemove, removable }) {
  const set = (key) => (e) => onChange(index, { ...passenger, [key]: e.target.value });

  return (
    <div className="rounded-xl border border-navy-100 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-navy-800">Passenger {index + 1}</p>
        {removable && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-xs font-medium text-coral-600 hover:text-coral-700"
          >
            Remove
          </button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label">Full name</label>
          <input required className="input" value={passenger.name} onChange={set('name')} placeholder="Jane Doe" />
        </div>
        <div>
          <label className="label">Age</label>
          <input required type="number" min="0" max="120" className="input" value={passenger.age} onChange={set('age')} />
        </div>
        <div>
          <label className="label">Passport no. (optional)</label>
          <input className="input" value={passenger.passportNumber} onChange={set('passportNumber')} placeholder="X1234567" />
        </div>
      </div>
    </div>
  );
}
