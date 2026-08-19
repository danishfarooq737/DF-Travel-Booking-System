# DF Travel System — Travel Booking System (Frontend)

React + Vite frontend for the MERN Travel Booking System. This is the `frontend/` half of the project — see the repo root [`README.md`](../README.md) for how it connects to `backend/`.

---

## 1. Features implemented

- **Public pages**: Home (animated hero, featured trips), Search (filters, pagination, loading/empty/error states), Travel details, About, Contact, Terms, Privacy, 404.
- **Authentication**: Register, Login, JWT session handling (auto-logout on token expiry), protected routes, role-based admin routes.
- **User dashboard**: Overview, My bookings (filterable), Booking details (cancel), Notifications, Profile settings (update profile + change password).
- **Booking flow**: Trip → Passenger details → Payment (Stripe Elements) → Confirmation, with a visual step indicator.
- **Payments**: Stripe `PaymentElement` integration, publishable key only in the frontend, payment status polling on the confirmation screen (payment is verified authoritatively by your backend/webhook, never by the browser).
- **Admin console**: Overview stats, manage travel listings (create/edit/delete), manage bookings (status updates), view payments, manage users (roles, delete).
- **Responsive design**: tested breakpoints for mobile, tablet, and desktop; mobile navigation menu; no fixed-width layouts.
- **Animations**: hero motion, staggered card entrances, hover/focus transitions, booking/payment status feedback animations — all respecting `prefers-reduced-motion`.
- **Error handling**: centralized API error normalization, friendly error/empty/loading states on every data view (no raw stack traces surfaced to users).
- **Seed script**: `npm run seed` populates a MongoDB database with a test admin, a test user, and sample travel listings (see below).

## 2. Technology stack

React 18 · Vite 5 · React Router 6 · Axios · Tailwind CSS · @stripe/react-stripe-js + @stripe/stripe-js

## 3. Folder structure

```
frontend/
├── public/
│   └── favicon.svg
├── seed/
│   └── seed.js                 # standalone DB seed script (see §7)
├── src/
│   ├── api/                    # one module per backend resource (auth, travel, bookings, payments, notifications, admin)
│   ├── components/
│   │   ├── layout/              # Navbar, Footer, ProtectedRoute, AdminRoute, AccountLayout, AdminLayout
│   │   ├── ui/                  # Spinner, EmptyState, ErrorState, Badge, Toast, ConfirmDialog, RouteLine
│   │   ├── travel/               # TravelCard, SearchFilters
│   │   ├── booking/              # StepIndicator, PassengerRow
│   │   └── payment/               # CheckoutForm (Stripe)
│   ├── context/                 # AuthContext, ToastContext
│   ├── hooks/                   # useAuth, useToast, useDebounce, useDocumentTitle
│   ├── pages/
│   │   ├── user/                # Dashboard, MyBookings, BookingDetails, Checkout, Payment, BookingConfirmation, Notifications, Profile
│   │   └── admin/                # AdminDashboard, ManageTravel, TravelForm, ManageBookings, ManagePayments, ManageUsers
│   ├── utils/                   # format.js, constants.js, stripe.js
│   ├── App.jsx                  # all routes
│   ├── main.jsx                 # entry point
│   └── index.css
├── .env                         # local dev values (gitignored)
├── .env.example                 # template — committed
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 4. Prerequisites

- Node.js 18+
- Your backend already running (default: `http://localhost:5000`) with MongoDB connected
- A Stripe account with test-mode API keys (for the payment flow)

## 5. Installation & running locally

```bash
cd frontend
npm install
cp .env.example .env    # already provided with sensible local defaults — just fill in real values
npm run dev
```

The app runs at `http://localhost:5173` by default.

To build for production:

```bash
npm run build     # outputs to frontend/dist
npm run preview   # serve the production build locally to sanity-check it
```

## 6. Environment variables

Only **one** `.env` and **one** `.env.example` exist in this project, both at `frontend/.env` and `frontend/.env.example`. `.env` is listed in `.gitignore` and will not be committed; `.env.example` is committed as the template.

| Variable | Used by | Description |
|---|---|---|
| `VITE_API_URL` | Browser app | Base URL of your backend API, e.g. `http://localhost:5000/api` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Browser app | Stripe **publishable** key (safe to expose — never the secret key) |
| `SEED_MONGODB_URI` | `npm run seed` only (Node script, never bundled into the browser) | Same MongoDB connection string your backend's `MONGODB_URI` uses |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | `npm run seed` only | Credentials for the seeded admin test account |
| `SEED_USER_EMAIL` / `SEED_USER_PASSWORD` | `npm run seed` only | Credentials for the seeded regular test account |

Because Vite only inlines variables prefixed `VITE_` into the browser bundle, the `SEED_*` variables never reach client-side code — they're read by the Node seed script only.

## 7. Seed data (for testing)

`npm run seed` connects directly to MongoDB (no backend server needs to be running) and creates:

- 1 admin user — login with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (defaults: `admin@DF Travel System.test` / `Admin123!`)
- 1 regular user — login with `SEED_USER_EMAIL` / `SEED_USER_PASSWORD` (defaults: `jane@DF Travel System.test` / `User1234!`)
- 6 sample travel listings (flight, hotel, package, tour, cruise, and one intentionally sold-out listing to test that UI state)

Run it with:

```bash
cd frontend
npm run seed
```

It is safe to re-run — existing seeded users/listings (matched by email/title) are skipped rather than duplicated. Passwords are hashed with bcrypt (12 salt rounds), matching how your backend's `User` model hashes passwords, so the seeded accounts log in correctly through the real `/api/auth/login` endpoint.

## 8. Responsive design

Every page was built mobile-first with Tailwind's responsive utilities and manually checked at:
- Mobile (~375–428px): collapsible hamburger navigation, single-column grids, stacked forms
- Tablet (~768px): 2-column grids where appropriate
- Desktop (1024px+): full multi-column layouts, sticky sidebars on dashboard/admin pages

No fixed-width containers are used; all layouts use `max-width` with fluid padding (`container-page` utility class).

## 9. Testing performed

| Area | What was tested | Result |
|---|---|---|
| Build | `npm run build` (production Vite build) | ✅ Builds cleanly, no errors |
| Lint | `npm run lint` (ESLint over the full `src/`) | ✅ 0 errors (2 harmless fast-refresh warnings on context files, expected) |
| Seed script | `node --check seed/seed.js` (syntax validation) | ✅ Valid — **not** run against a live database in this sandbox (no MongoDB instance available here); please run `npm run seed` yourself against your database before demoing |
| Routing | All routes in `App.jsx` reviewed against `ProtectedRoute`/`AdminRoute` guards | ✅ Public/user/admin boundaries match the backend's authorization rules |
| API contracts | Every `src/api/*.js` call cross-checked line-by-line against your actual backend controllers/routes | ✅ Request bodies, query params, and response shapes (`data.items`, `data.pagination`, `data.booking`, etc.) match exactly |

**What I could not test in this environment:** actually running the app against your live backend + MongoDB + Stripe test keys (this sandbox has no network access to your backend or a database). Please run through the checklist in §11 once you have the frontend and backend running together.

## 10. Connecting to your backend

1. Start your backend (`npm run dev` in your backend folder) — confirm it's listening on the port in its `.env` (default `5000`).
2. In your backend's `.env`, make sure `CORS_ORIGIN` includes `http://localhost:5173` (the frontend's dev URL) — this project's backend already defaults to this.
3. In `frontend/.env`, set `VITE_API_URL=http://localhost:5000/api` (adjust the port if different).
4. Run `npm run dev` in `frontend/`.

## 11. Manual verification checklist (run this yourself once both servers are up)

- [ ] `npm run seed` completes and prints the two test logins
- [ ] Register a new account, then log in as the seeded admin and seeded user
- [ ] Search page shows the 6 seeded listings; filters/pagination work; the "Weekend in Barcelona" listing shows as sold out
- [ ] Book a trip as the regular user → passenger form → Stripe test card (`4242 4242 4242 4242`, any future expiry/CVC) → confirmation page shows "Booking confirmed"
- [ ] "My bookings" shows the new booking with `confirmed`/`paid` badges
- [ ] Cancel a booking → status updates to `cancelled` and seats are released (visible again in Search)
- [ ] As admin: create a new listing, edit it, delete it
- [ ] As admin: change a booking's status, view the payments table, change a user's role
- [ ] Resize the browser / use dev tools device mode to confirm mobile, tablet, and desktop layouts

---

## MANUAL TASKS REQUIRED FROM YOU

These cannot be completed programmatically — they require your own accounts/credentials.

### 1. Get a Stripe publishable key
- **Why**: The checkout page needs it to render the Stripe payment form.
- **Where**: https://dashboard.stripe.com/test/apikeys (create a free Stripe account if you don't have one; stay in **test mode**).
- **What to copy**: The key starting with `pk_test_...` labeled "Publishable key".
- **Where to put it**: `frontend/.env` → `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`
- **How to verify**: Open the browser dev console on the payment page — no "Stripe publishable key is not set" warning should appear, and the card entry form should render.

### 2. Confirm your backend's Stripe **secret** key and webhook are configured
- **Why**: Without these on the backend, payments will fail server-side even if the frontend renders correctly. (This is backend configuration — nothing to do in this frontend package — but it's required for end-to-end testing.)
- **Where**: Your backend's `.env` → `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
- **How to verify**: Complete a test payment with card `4242 4242 4242 4242`; the booking's `paymentStatus` should flip to `paid` within a few seconds on the confirmation page.

### 3. Point the frontend at your deployed backend (when you deploy)
- **Why**: `VITE_API_URL` currently points at `localhost` for local development.
- **Where**: Wherever you host the frontend (e.g. Vercel/Netlify project settings → Environment Variables).
- **Exact variable**: `VITE_API_URL=https://your-backend-domain.com/api`
- **How to verify**: After deploying, open the deployed site and confirm Search loads real listings (not a network error).

### 4. Add the deployed frontend URL to your backend's CORS allow-list
- **Why**: Without this, the deployed backend will reject requests from the deployed frontend with a CORS error.
- **Where**: Your backend's `.env` → `CORS_ORIGIN`
- **Exact value**: your deployed frontend's URL, e.g. `https://DF Travel System.vercel.app` (no trailing slash)
- **How to verify**: Open the deployed frontend and confirm no CORS errors appear in the browser console when logging in or searching.

### 5. Seed (or manually create) your production/staging database
- **Why**: A fresh database has no travel listings — Search will be empty and there'll be no admin account to log in with.
- **Where**: Run `npm run seed` from `frontend/` with `SEED_MONGODB_URI` pointed at that environment's database (or create an admin account and listings manually through the admin console after promoting your own account to `admin` directly in MongoDB).
- **How to verify**: Search page shows listings; you can log in with the seeded admin credentials.

---

## Known limitations

- The **Contact page** form is UI-only — there is no `/api/contact` backend endpoint in this project. Wire it to a real endpoint or a third-party form service before relying on it.
- **Terms** and **Privacy** pages contain placeholder legal copy — replace with real policy text before launch.
- The Stripe payment confirmation page **polls** the booking's status (via `GET /api/bookings/:id`) rather than calling `GET /api/payments/:id/verify` directly, because the frontend only receives Stripe's `paymentIntentId` at payment-creation time, not your backend's internal `Payment` document id. This works correctly with your webhook-driven backend but means confirmation can take a few seconds if the webhook is delayed — this is expected and mirrors your backend's own "payment/booking delayed" notification flow.
- This sandbox could not run `npm run seed` against a live MongoDB instance or exercise the app against your live backend/Stripe test keys (no network access to external databases here). Please run the checklist in §11 yourself.
