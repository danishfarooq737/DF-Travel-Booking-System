import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function Terms() {
  useDocumentTitle('Terms of service');
  return (
    <div className="container-page max-w-2xl py-16">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-2 text-3xl font-semibold">Terms of service</h1>
      <div className="prose prose-navy mt-6 max-w-none space-y-4 text-sm leading-relaxed text-navy-600">
        <p>
          This is placeholder legal copy. Replace it with your organization's actual terms of service before
          launching to real customers — specifically around booking, cancellation, and payment policies.
        </p>
        <p>
          By using DF Travel System, you agree to provide accurate passenger information at booking time, that all payments
          are final once a booking status changes to "confirmed" except where a trip's cancellation policy allows
          otherwise, and that DF Travel System is not liable for third-party travel provider delays or cancellations.
        </p>
      </div>
    </div>
  );
}
