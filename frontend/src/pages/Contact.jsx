import { useState } from 'react';
import useToast from '../hooks/useToast.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function Contact() {
  useDocumentTitle('Contact us');
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  // NOTE: There is no backend "/api/contact" endpoint in this project.
  // This form is a UI-only placeholder; wire it up to a real endpoint
  // or a third-party form service before relying on it in production.
  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    toast.success('Message captured locally. Connect a backend endpoint to deliver it.');
  };

  return (
    <div className="container-page py-16">
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="animate-fadeUp">
          <p className="eyebrow">Get in touch</p>
          <h1 className="mt-2 text-3xl font-semibold">We're here to help</h1>
          <p className="mt-4 max-w-md text-navy-500">
            Questions about a booking, a payment, or a trip? Send us a note and our team will follow up by email.
          </p>

          <dl className="mt-8 space-y-4 text-sm">
            <div>
              <dt className="font-semibold text-navy-800">Support email</dt>
              <dd className="text-navy-500">support@DF Travel System.example</dd>
            </div>
            <div>
              <dt className="font-semibold text-navy-800">Hours</dt>
              <dd className="text-navy-500">Monday – Friday, 9am – 6pm</dd>
            </div>
          </dl>
        </div>

        <form onSubmit={handleSubmit} className="card animate-fadeUp space-y-4 p-6" style={{ animationDelay: '0.1s' }}>
          {sent && (
            <p className="rounded-lg bg-teal-500/10 px-3 py-2 text-sm font-medium text-teal-700">
              Thanks — your message has been captured.
            </p>
          )}
          <div>
            <label className="label" htmlFor="name">Name</label>
            <input id="name" required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="message">Message</label>
            <textarea id="message" required rows={5} className="input resize-none" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary w-full">Send message</button>
        </form>
      </div>
    </div>
  );
}
