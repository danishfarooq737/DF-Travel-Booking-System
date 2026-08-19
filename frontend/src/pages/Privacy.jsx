import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function Privacy() {
  useDocumentTitle('Privacy policy');
  return (
    <div className="container-page max-w-2xl py-16">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-2 text-3xl font-semibold">Privacy policy</h1>
      <div className="prose prose-navy mt-6 max-w-none space-y-4 text-sm leading-relaxed text-navy-600">
        <p>
          This is placeholder legal copy. Replace it with your organization's actual privacy policy before launch.
        </p>
        <p>
          DF Travel System stores your name, email, phone number, and booking history to process trips and payments. Payment
          card details are handled entirely by Stripe and are never stored on DF Travel System's servers. You can request
          account deletion by contacting support.
        </p>
      </div>
    </div>
  );
}
