import { TRAVEL_TYPES } from '../../utils/constants.js';

export default function SearchFilters({ filters, onChange, onSubmit, onReset }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="card flex flex-col gap-4 p-5"
    >
      <div>
        <label className="label" htmlFor="destination">Destination</label>
        <input
          id="destination"
          className="input"
          placeholder="e.g. Bali, Paris, Tokyo…"
          value={filters.destination}
          onChange={set('destination')}
        />
      </div>

      <div>
        <label className="label" htmlFor="travelType">Travel type</label>
        <select id="travelType" className="input" value={filters.travelType} onChange={set('travelType')}>
          <option value="">Any type</option>
          {TRAVEL_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="minPrice">Min price</label>
          <input id="minPrice" type="number" min="0" className="input" value={filters.minPrice} onChange={set('minPrice')} />
        </div>
        <div>
          <label className="label" htmlFor="maxPrice">Max price</label>
          <input id="maxPrice" type="number" min="0" className="input" value={filters.maxPrice} onChange={set('maxPrice')} />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="travelers">Travelers</label>
        <input id="travelers" type="number" min="1" className="input" value={filters.travelers} onChange={set('travelers')} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="dateFrom">From</label>
          <input id="dateFrom" type="date" className="input" value={filters.dateFrom} onChange={set('dateFrom')} />
        </div>
        <div>
          <label className="label" htmlFor="dateTo">To</label>
          <input id="dateTo" type="date" className="input" value={filters.dateTo} onChange={set('dateTo')} />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit" className="btn-primary flex-1">Apply filters</button>
        <button type="button" onClick={onReset} className="btn-outline">Reset</button>
      </div>
    </form>
  );
}
