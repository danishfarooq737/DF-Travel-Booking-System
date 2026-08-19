# DF Travel Booking System  — MERN Travel Booking System

A full-stack travel booking platform: search trips, book with passenger details, pay securely via Stripe, and manage everything from a user dashboard or admin console.

```
travel-booking-system/
├── backend/     Node.js + Express + MongoDB REST API
├── frontend/    React + Vite client (DF Travel Booking System)
├── package.json Convenience scripts to run both from the repo root
└── .gitignore
```

Each app has its **own** README with full setup detail:
- [`backend/README.md`](./backend/README.md)
- [`frontend/README.md`](./frontend/README.md)

This root README covers only how the two fit together.

---

## Quick start

```bash
# from the repo root
npm run install:all

# terminal 1 — backend (http://localhost:5000)
cp backend/.env.example backend/.env   # already provided with local dev defaults — fill in real Stripe/email/Mongo values
npm run dev:backend

# terminal 2 — frontend (http://localhost:5173)
cp frontend/.env.example frontend/.env # already provided with local dev defaults
npm run dev:frontend
```

Open `http://localhost:5173`.

## Seeding test data

Two equivalent seed scripts are provided — use whichever is more convenient:

```bash
npm run seed:backend    # runs backend/seed/seed.js (uses the backend's own Mongoose models)
npm run seed:frontend   # runs frontend/seed/seed.js (connects to MongoDB directly, no backend required)
```

Both create the same result: 1 admin user, 1 regular user, and 6 sample travel listings. Running both is harmless — the scripts skip anything that already exists (matched by email/title) rather than duplicating it. See either app's README for the exact login credentials and how to override them.

## How the two apps connect

- The frontend calls the backend at `VITE_API_URL` (in `frontend/.env`), which should point to `http://localhost:5000/api` locally.
- The backend must list the frontend's origin in `CORS_ORIGIN` (in `backend/.env`) — it already defaults to `http://localhost:5173`.
- Authentication is stateless JWT bearer tokens (no cookies), sent as `Authorization: Bearer <token>`.
- Payments: the frontend only ever holds the Stripe **publishable** key (`VITE_STRIPE_PUBLISHABLE_KEY`); the backend holds the **secret** key and verifies every payment server-side via Stripe's API and webhook — the browser is never trusted to report a payment as successful.

## What was verified before this delivery

- `backend`: every `.js` file passed `node --check` (no syntax errors); `npm install` completes cleanly; the server boots and correctly attempts a MongoDB connection (confirmed — it reached the connection step rather than crashing on a `require`/import error, which is what happens when the code is not wired correctly).
- `frontend`: `npm install`, `npm run build` (production Vite build), and `npm run lint` (ESLint) all pass cleanly with zero errors.
- Every frontend API call was cross-checked line-by-line against the backend's actual routes/controllers (request bodies, query params, and response shapes match exactly).

**Not verified in this environment** (no network access to a live MongoDB instance, or to Stripe, from this sandbox): actually running the two apps together end-to-end, or running the seed scripts against a live database. Please run through both README's manual verification checklists once you have MongoDB running.

## Animations

The frontend implements four distinct animation experiences, all respecting `prefers-reduced-motion`:
1. **Hero/visual** — floating gradient blobs and a floating trip-summary card on the homepage.
2. **Entrance animations** — fade-up on cards and page sections as they render.
3. **Hover/focus transitions** — buttons, cards, and nav links (200–300ms, per the motion spec).
4. **Booking/status feedback** — an animated checkmark draw-in on booking confirmation, a pulsing "pending" state, and toast notifications.

## Manual tasks required from you

See the **"MANUAL TASKS REQUIRED FROM ME"** sections in [`backend/README.md`](./backend/README.md) and [`frontend/README.md`](./frontend/README.md) — these cover creating a MongoDB Atlas database, Stripe account/keys, email provider credentials, and deployment configuration, none of which can be completed programmatically on your behalf.
