import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createTravel, getTravelById, updateTravel } from '../../api/travel.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import useToast from '../../hooks/useToast.js';
import PageLoader from '../../components/ui/PageLoader.jsx';
import { TRAVEL_TYPES } from '../../utils/constants.js';

const blankForm = {
  title: '',
  destination: '',
  departureCity: '',
  description: '',
  travelType: 'package',
  price: '',
  currency: 'USD',
  totalSeats: '',
  durationDays: '',
  departureDate: '',
  returnDate: '',
  status: 'active',
  images: '',
};

export default function TravelForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();
  useDocumentTitle(isEdit ? 'Edit listing' : 'New listing');

  const [form, setForm] = useState(blankForm);
  const [currentSeats, setCurrentSeats] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    getTravelById(id)
      .then((res) => {
        const t = res.data.travel;
        setForm({
          ...blankForm,
          ...t,
          departureDate: t.departureDate?.slice(0, 10) || '',
          returnDate: t.returnDate?.slice(0, 10) || '',
          images: (t.images || []).join(', '),
        });
        setCurrentSeats({ available: t.availableSeats, total: t.totalSeats });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        totalSeats: Number(form.totalSeats),
        durationDays: Number(form.durationDays),
        images: form.images
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      if (isEdit) {
        await updateTravel(id, payload);
        toast.success('Listing updated');
      } else {
        await createTravel(payload);
        toast.success('Listing created');
      }
      navigate('/admin/travel');
    } catch (err) {
      setError(err.message || 'Could not save listing.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-2xl">
      <p className="eyebrow">Admin</p>
      <h1 className="mt-1 text-2xl font-semibold">{isEdit ? 'Edit listing' : 'New travel listing'}</h1>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-4 p-6">
        {error && <p className="rounded-lg bg-coral-50 px-3 py-2 text-sm font-medium text-coral-700">{error}</p>}

        <div>
          <label className="label">Title</label>
          <input required className="input" value={form.title} onChange={set('title')} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Destination</label>
            <input required className="input" value={form.destination} onChange={set('destination')} />
          </div>
          <div>
            <label className="label">Departure city</label>
            <input required className="input" value={form.departureCity} onChange={set('departureCity')} />
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea required rows={4} className="input resize-none" value={form.description} onChange={set('description')} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Travel type</label>
            <select className="input" value={form.travelType} onChange={set('travelType')}>
              {TRAVEL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={set('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="soldout">Sold out</option>
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="label">Price</label>
            <input required type="number" min="0" step="0.01" className="input" value={form.price} onChange={set('price')} />
          </div>
          <div>
            <label className="label">Currency</label>
            <input required maxLength={3} className="input uppercase" value={form.currency} onChange={set('currency')} />
          </div>
          <div>
            <label className="label">Duration (days)</label>
            <input required type="number" min="1" className="input" value={form.durationDays} onChange={set('durationDays')} />
          </div>
        </div>

        <div>
          <label className="label">Total seats</label>
          <input required type="number" min="0" className="input" value={form.totalSeats} onChange={set('totalSeats')} />
          {isEdit && currentSeats && (
            <p className="mt-1 text-xs text-navy-400">
              Currently {currentSeats.available} of {currentSeats.total} seats available. Increasing total seats
              adds the difference to available seats automatically.
            </p>
          )}
          {!isEdit && (
            <p className="mt-1 text-xs text-navy-400">Available seats will start equal to total seats.</p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Departure date</label>
            <input required type="date" className="input" value={form.departureDate} onChange={set('departureDate')} />
          </div>
          <div>
            <label className="label">Return date (optional)</label>
            <input type="date" className="input" value={form.returnDate} onChange={set('returnDate')} />
          </div>
        </div>

        <div>
          <label className="label">Image URLs (comma-separated)</label>
          <input className="input" placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" value={form.images} onChange={set('images')} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting} className="btn-primary flex-1">
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create listing'}
          </button>
          <button type="button" onClick={() => navigate('/admin/travel')} className="btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
