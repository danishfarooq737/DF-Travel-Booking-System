export const TRAVEL_TYPES = [
  { value: 'flight', label: 'Flight' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'package', label: 'Package' },
  { value: 'tour', label: 'Tour' },
  { value: 'cruise', label: 'Cruise' },
];

export const BOOKING_STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-teal-500/10 text-teal-600',
  cancelled: 'bg-navy-100 text-navy-500',
  completed: 'bg-navy-800/10 text-navy-800',
};

export const PAYMENT_STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800',
  paid: 'bg-teal-500/10 text-teal-600',
  failed: 'bg-coral-100 text-coral-700',
  refunded: 'bg-navy-100 text-navy-500',
};

export const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];

// The Payment model (admin payments list) uses a different status enum than
// Booking.paymentStatus — Stripe-facing statuses, not the booking-facing ones.
export const PAYMENT_ADMIN_STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800',
  succeeded: 'bg-teal-500/10 text-teal-600',
  failed: 'bg-coral-100 text-coral-700',
  cancelled: 'bg-navy-100 text-navy-500',
  refunded: 'bg-navy-100 text-navy-500',
};
