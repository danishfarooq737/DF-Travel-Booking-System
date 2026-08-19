import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils/format.js';

const TYPE_LABELS = { flight: 'Flight', hotel: 'Hotel', package: 'Package', tour: 'Tour', cruise: 'Cruise' };

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320"><rect width="480" height="320" fill="#eef3f7"/><path d="M0 220 C 120 160, 200 260, 320 190 S 480 140, 480 140 L480 320 L0 320 Z" fill="#d4e2ec"/></svg>`
  );

export default function TravelCard({ travel }) {
  const image = travel.images?.[0] || PLACEHOLDER;
  const soldOut = travel.status === 'soldout' || travel.availableSeats === 0;

  return (
    <Link
      to={`/travel/${travel._id}`}
      className="card card-hover group flex flex-col overflow-hidden animate-fadeUp"
    >
      <div className="relative h-44 w-full overflow-hidden bg-navy-100">
        <img
          src={image}
          alt={travel.title}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
        <span className="absolute left-3 top-3 badge bg-white/90 text-navy-700 backdrop-blur-sm">
          {TYPE_LABELS[travel.travelType] || 'Trip'}
        </span>
        {soldOut && (
          <span className="absolute right-3 top-3 badge bg-navy-900/90 text-white">Sold out</span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="eyebrow">{travel.destination}</p>
        <h3 className="mt-1 line-clamp-2 font-display text-lg font-semibold leading-snug text-navy-900 transition-colors group-hover:text-coral-600">
          {travel.title}
        </h3>
        <p className="mt-1.5 text-sm text-navy-500">
          Departs {formatDate(travel.departureDate)} · {travel.durationDays} day{travel.durationDays === 1 ? '' : 's'}
        </p>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <span className="font-mono text-lg font-semibold text-navy-900">
              {formatCurrency(travel.price, travel.currency)}
            </span>
            <span className="ml-1 text-xs text-navy-400">/ traveler</span>
          </div>
          <span className="text-xs font-medium text-navy-400">
            {travel.availableSeats} seat{travel.availableSeats === 1 ? '' : 's'} left
          </span>
        </div>
      </div>
    </Link>
  );
}
