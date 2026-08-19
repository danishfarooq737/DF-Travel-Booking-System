import RouteLine from '../components/ui/RouteLine.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

const VALUES = [
  { title: 'Transparent pricing', body: 'The price you see is the price you pay — calculated server-side, never adjusted client-side.' },
  { title: 'Verified payments', body: 'Every booking is confirmed only after Stripe verifies the payment on our backend.' },
  { title: 'Built for real trips', body: 'Flights, hotels, tours, and cruises, all tracked from search to confirmation in one dashboard.' },
];

export default function About() {
  useDocumentTitle('About');
  return (
    <div className="container-page py-16">
      <div className="max-w-2xl animate-fadeUp">
        <p className="eyebrow">About DF Travel System</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Booking travel shouldn't feel like a leap of faith.</h1>
        <p className="mt-4 text-navy-500">
          DF Travel System is a travel booking platform built to make the entire journey — search, booking, payment, and
          confirmation — clear and trustworthy. Every step, from checking seat availability to verifying a payment,
          happens on a secure backend so nothing is left to guesswork.
        </p>
        <RouteLine className="mt-8 h-10 w-52 text-coral-400" />
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        {VALUES.map((v) => (
          <div key={v.title} className="card p-6">
            <h3 className="font-display text-lg font-semibold text-navy-900">{v.title}</h3>
            <p className="mt-2 text-sm text-navy-500">{v.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
