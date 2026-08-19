# Travel Booking System — Backend API

A production-oriented REST API for a MERN travel booking system, built with
Node.js, Express, and MongoDB (Mongoose). This repository contains **only
the backend**. The frontend (React/Vite) is a separate deliverable.

---

## 1. Project Overview

This API supports the full booking lifecycle: user registration/login,
browsing and searching travel listings, creating bookings, paying securely
via Stripe, receiving email notifications, and an admin panel for managing
users, listings, bookings, and payments.

## 2. Features Implemented

- **Authentication**: register, login, get current user, update profile,
  change password, logout. Passwords hashed with bcrypt (12 salt rounds).
  JWT bearer-token authentication. Account lockout after 5 failed login
  attempts (15-minute lock). Generic "invalid email or password" message on
  login failure to prevent account enumeration.
- **Authorization**: role-based access control (`user` / `admin`).
  Every protected resource re-checks ownership/role **on the server** —
  frontend route guards are never trusted.
- **Travel listings**: public search/filter (destination, price range,
  travelers, dates, type) with pagination; admin create/update/delete.
- **Bookings**: atomic seat reservation (race-condition safe using an
  atomic `findOneAndUpdate` with a seat-availability guard), server-side
  price calculation (client-submitted prices are never trusted),
  cancellation with automatic seat release.
- **Payments (Stripe)**: PaymentIntent creation, webhook handler with
  signature verification, idempotent status reconciliation (won't double
  process the same event), duplicate-payment prevention (reuses a pending
  PaymentIntent instead of creating a new one), manual verification
  fallback endpoint.
- **Notifications**: email service using Nodemailer. Sends booking
  confirmation, payment failure, payment pending/delayed, and cancellation
  emails. Email failures are logged and never break the booking flow.
  A `Notification` record is stored in the database for every event
  regardless of whether the email itself succeeded.
- **Admin panel API**: manage users (role/active status), view/update all
  bookings, view all payments.
- **Security hardening**: Helmet security headers, explicit CORS
  allow-list, rate limiting (general + strict auth + booking/payment),
  NoSQL-injection sanitization, centralized error handler that never
  leaks stack traces in production, request size limits, express-validator
  on every input.

## 3. Technology Stack

- Node.js / Express.js
- MongoDB / Mongoose
- JWT (jsonwebtoken) + bcryptjs
- Stripe (payments)
- Nodemailer (email)
- Helmet, cors, express-rate-limit, express-mongo-sanitize, express-validator
- Jest + Supertest (automated tests)

## 4. Folder Structure

```
backend/
├── config/
│   ├── db.js                # MongoDB connection
│   └── corsOptions.js       # CORS allow-list configuration
├── controllers/
│   ├── authController.js
│   ├── travelController.js
│   ├── bookingController.js
│   ├── paymentController.js
│   ├── notificationController.js
│   └── adminController.js
├── middleware/
│   ├── auth.js              # protect() + authorize()
│   ├── validate.js          # express-validator result handler
│   ├── rateLimiter.js       # apiLimiter, authLimiter, bookingLimiter
│   ├── notFound.js
│   └── errorHandler.js      # centralized error handler
├── models/
│   ├── User.js
│   ├── Travel.js
│   ├── Booking.js
│   ├── Payment.js
│   └── Notification.js
├── routes/
│   ├── authRoutes.js
│   ├── travelRoutes.js
│   ├── bookingRoutes.js
│   ├── paymentRoutes.js
│   ├── notificationRoutes.js
│   └── adminRoutes.js
├── services/
│   ├── emailService.js
│   └── stripeService.js
├── utils/
│   ├── asyncHandler.js
│   ├── ApiError.js
│   ├── generateToken.js
│   └── validators.js
├── tests/
│   └── health.test.js
├── app.js                   # Express app (routes/middleware wiring)
├── server.js                # Entry point (connects DB, starts listener)
├── package.json
├── .env                     # local dev values — NOT committed (gitignored)
├── .env.example              # template — safe to commit
└── .gitignore
```

## 5. Installation

Requires **Node.js 18+** and a MongoDB database (Atlas recommended).

```bash
cd backend
npm install
cp .env.example .env     # then fill in real values (see section 6)
npm run dev               # starts with nodemon on http://localhost:5000
```

Health check: `GET http://localhost:5000/api/health`

## 6. Environment Variables

See `.env.example` for the full template. Summary:

| Variable | Required | Purpose |
|---|---|---|
| `NODE_ENV` | Yes | `development`, `production`, or `test` |
| `PORT` | No (default 5000) | API port |
| `MONGODB_URI` | Yes | MongoDB Atlas (or local) connection string |
| `JWT_SECRET` | Yes | Secret used to sign JWTs — must be long & random |
| `JWT_EXPIRE` | No (default `7d`) | Access token lifetime |
| `CORS_ORIGIN` | Yes | Comma-separated list of allowed frontend origins |
| `CLIENT_URL` | Yes | Frontend base URL (used in emails) |
| `STRIPE_SECRET_KEY` | Yes, for payments | Stripe secret key (test or live) |
| `STRIPE_WEBHOOK_SECRET` | Yes, for payments | Stripe webhook signing secret |
| `EMAIL_HOST/PORT/USER/PASSWORD/FROM` | Yes, for email | SMTP credentials |
| `GOOGLE_CLIENT_ID/SECRET` | No | Only needed if Google OAuth is added later |

**The API is fully functional without Stripe/email configured** — it will
simply skip sending emails (logged, not thrown) and return a clear `503`
error if a payment endpoint is called before Stripe keys are set.

## 7. Database Setup

Use MongoDB Atlas (free tier is sufficient) or a local MongoDB instance.
No manual schema creation is needed — Mongoose creates collections and
indexes automatically on first use. See section 12 ("Manual Tasks") for
step-by-step Atlas setup.

## 8. API Documentation

All responses follow the shape `{ success: boolean, message?, data?, errors? }`.
All protected routes require header: `Authorization: Bearer <token>`.

### Auth — `/api/auth`
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register a new user |
| POST | `/login` | Public | Login, returns JWT |
| GET | `/me` | Private | Get current user |
| PUT | `/profile` | Private | Update name/phone |
| PUT | `/change-password` | Private | Change password |
| POST | `/logout` | Private | Logout (stateless — client discards token) |

### Travel — `/api/travel`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Search/filter/paginate listings |
| GET | `/:id` | Public | Get one listing |
| POST | `/` | Admin | Create listing |
| PUT | `/:id` | Admin | Update listing |
| DELETE | `/:id` | Admin | Delete listing |

### Bookings — `/api/bookings`
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/` | Private | Create booking (reserves seats) |
| GET | `/` | Private | List own bookings (admin: all bookings) |
| GET | `/:id` | Private (owner/admin) | Get one booking |
| PUT | `/:id/cancel` | Private (owner/admin) | Cancel booking, release seats |

### Payments — `/api/payments`
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/create` | Private (owner) | Create Stripe PaymentIntent for a booking |
| GET | `/:id` | Private (owner/admin) | Get payment record |
| GET | `/:id/verify` | Private (owner/admin) | Re-verify status directly against Stripe |
| POST | `/webhook` | Public (Stripe-signed) | Stripe webhook — authoritative payment status |

### Notifications — `/api/notifications`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Private | List own notifications |
| PUT | `/:id/read` | Private (owner) | Mark as read |

### Admin — `/api/admin`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/users` | Admin | List all users |
| PUT | `/users/:id` | Admin | Update role/active status |
| DELETE | `/users/:id` | Admin | Delete a user |
| GET | `/bookings` | Admin | List all bookings |
| PUT | `/bookings/:id` | Admin | Override booking status |
| GET | `/payments` | Admin | List all payments |

## 9. Authentication Setup

No manual setup required beyond generating a `JWT_SECRET` (instructions in
`.env.example`). The architecture uses a bearer token (not cookies), so no
CSRF middleware is needed — see the comment in `utils/generateToken.js` for
the full reasoning.

## 10. Payment Setup (Stripe)

See section 12 "Manual Tasks Required From Me" for exact step-by-step
instructions to create a Stripe account, get API keys, and configure the
webhook endpoint.

## 11. Email Setup

See section 12 for step-by-step SMTP credential setup (Gmail App Password
example included).

## 12. MANUAL TASKS REQUIRED FROM ME

These are the only things that genuinely require your (or your manager's)
action — everything else in the code is already complete.

### Task 1 — Create a MongoDB Atlas database
- **Why**: The API needs a real database to store users, bookings, etc.
- **Where**: https://www.mongodb.com/cloud/atlas/register
- **Steps**:
  1. Create a free account and a new free-tier (M0) cluster.
  2. Under "Database Access", create a database user with a strong password.
  3. Under "Network Access", add your IP (or `0.0.0.0/0` for testing only —
     restrict this in production).
  4. Click "Connect" → "Drivers" → copy the connection string.
- **Env variable**: `MONGODB_URI` in `backend/.env`
- **Verify**: run `npm run dev` — you should see `MongoDB connected: ...` in
  the terminal instead of a connection error.

### Task 2 — Create a Stripe account and get API keys
- **Why**: Required to process real (or test-mode) payments.
- **Where**: https://dashboard.stripe.com/register
- **Steps**:
  1. Create an account (test mode is enabled by default — no business
     verification needed to start testing).
  2. Go to **Developers → API keys**.
  3. Copy the **Secret key** (starts with `sk_test_...`).
- **Env variable**: `STRIPE_SECRET_KEY` in `backend/.env`
- **Verify**: call `POST /api/payments/create` with a valid booking — you
  should get back a `clientSecret` instead of a 503 error.

### Task 3 — Configure the Stripe webhook
- **Why**: Stripe notifies the backend of payment success/failure via a
  webhook — this is the only trusted source of truth for payment status.
- **Where**: https://dashboard.stripe.com/test/webhooks
- **Steps**:
  1. Click "Add endpoint".
  2. Endpoint URL: `https://<your-deployed-backend-url>/api/payments/webhook`
     (for local testing, use the Stripe CLI: `stripe listen --forward-to
     localhost:5000/api/payments/webhook`).
  3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`,
     `payment_intent.canceled`, `payment_intent.processing`.
  4. Copy the **Signing secret** (starts with `whsec_...`).
- **Env variable**: `STRIPE_WEBHOOK_SECRET` in `backend/.env`
- **Verify**: trigger a test payment — the webhook event should appear in
  the Stripe dashboard's webhook logs with a `200` response.

### Task 4 — Configure an email account for sending notifications
- **Why**: Booking confirmation/failure/pending emails are sent via SMTP.
- **Where (recommended for testing)**: Gmail App Passwords —
  https://myaccount.google.com/apppasswords (requires 2-Step Verification
  enabled on the Google account first, at
  https://myaccount.google.com/signinoptions/two-step-verification).
- **Steps**:
  1. Enable 2-Step Verification on the Gmail account.
  2. Go to "App Passwords", create one named "Travel Booking Backend".
  3. Copy the generated 16-character password.
- **Env variables** in `backend/.env`:
  - `EMAIL_HOST=smtp.gmail.com`
  - `EMAIL_PORT=587`
  - `EMAIL_USER=<your gmail address>`
  - `EMAIL_PASSWORD=<the 16-character app password>`
  - `EMAIL_FROM="Travel Booking System <your gmail address>"`
- **Verify**: complete a test booking — you should receive a confirmation
  email, and no `[email] Failed to send...` warning in the server logs.
  (For production, consider a transactional email provider such as
  SendGrid, Mailgun, or Amazon SES instead of a personal Gmail account.)

### Task 5 — Create the GitHub repository
- **Why**: To share the code with your team/manager and enable deployment.
- **Where**: https://github.com/new
- **Steps**:
  1. Create a new **private** repository (recommended, since it will later
     contain frontend code and configuration details).
  2. Do **not** check "Add a README" (this project already has one).
  3. Follow GitHub's instructions to push this existing folder:
     ```bash
     git init
     git add .
     git commit -m "Initial backend commit"
     git branch -M main
     git remote add origin https://github.com/<your-username>/<repo-name>.git
     git push -u origin main
     ```
- **Verify**: refresh the GitHub repo page and confirm `.env` is **not**
  listed among the committed files (only `.env.example` should appear).

### Task 6 — Deployment environment variables
- **Why**: When deploying (e.g. Render, Railway, Fly.io), the platform
  needs the same variables as your local `.env`.
- **Where**: Your hosting provider's dashboard → Environment Variables /
  Secrets section.
- **Steps**: Copy every variable from `backend/.env` into the platform's
  environment variable settings (never commit these — enter them directly
  in the dashboard).
- **Verify**: After deploying, call `GET /api/health` on the deployed URL
  and confirm it returns `{ "success": true, ... }`.

## 13. Testing

```bash
npm test
```

This runs the automated Jest/Supertest suite covering the health check,
404 handling, input-validation rejection, and protected-route rejection
without a token. All 7 tests pass as of this delivery.

**Note on scope**: these tests run against the Express app directly and do
not require a live database connection (they test routing, validation, and
auth-guard behavior). Full end-to-end tests against a live MongoDB/Stripe
sandbox were not run in this environment because it has no network access
to MongoDB or Stripe — this should be the first thing verified once you
add real credentials (see Manual Tasks above). The full request/response
code paths were manually traced and every file was verified to load
without import/syntax errors.

## 14. Build & Run Instructions

```bash
npm install
npm run dev     # development, with auto-reload
npm start       # production
npm test        # run test suite
```

## 15. Deployment Instructions

- **Backend hosting**: Render, Railway, Fly.io, or any Node-compatible host.
  Set the start command to `npm start` and add all environment variables
  from `.env` in the platform's dashboard.
- **Database**: MongoDB Atlas (see Task 1).
- **Payments**: Stripe (see Tasks 2–3) — remember to switch to live keys
  and re-create the webhook endpoint pointing at your production URL when
  going live.
- **Email**: SMTP provider (see Task 4) — for production volume, use a
  dedicated transactional provider rather than a personal Gmail account.
- Set `NODE_ENV=production` and `CORS_ORIGIN` to your real frontend domain
  in the production environment.

## 16. Known Limitations

- No refresh-token rotation — the access token simply expires after
  `JWT_EXPIRE` and the user must log in again. This is a documented
  architectural trade-off, not an oversight (see comment in
  `utils/generateToken.js`).
- No automated background job to release seats for bookings that are
  created but never paid for (they remain `pending` indefinitely and hold
  their seats). A recommended production improvement is a scheduled job
  that cancels unpaid bookings after e.g. 30 minutes and releases seats.
- Google OAuth is not implemented — env variables are present as
  placeholders only, for future use.
- No file/image upload endpoint — the `images` field on `Travel` accepts
  URL strings only. Add a service like Cloudinary or S3 if direct image
  upload is required.
- End-to-end tests against a live database/Stripe sandbox were not run in
  this development environment (see section 13).

## 17. Security Report

### Security controls implemented
- Password hashing with bcrypt (12 rounds); passwords/hashes never
  returned in any API response.
- JWT bearer-token authentication; no session cookies (removes CSRF as an
  attack vector for this API's architecture).
- Account lockout after 5 failed logins (15-minute cooldown).
- Server-side authorization on every protected resource — ownership is
  re-verified on every request regardless of what the client claims.
- Rate limiting: general API (100/15min), auth endpoints (10/15min),
  booking/payment endpoints (20/10min).
- Helmet security headers (CSP, frame-ancestors, etc.).
- Explicit CORS allow-list — no wildcard origin.
- `express-mongo-sanitize` strips `$`/`.` operators from user input to
  prevent NoSQL injection.
- `express-validator` validates and rejects malformed input on every
  write endpoint before it reaches a controller.
- Request body size capped at 10kb to reduce DoS surface.
- Centralized error handler: stack traces, connection strings, and
  internal details are never sent to the client in production.
- Prices/amounts are always calculated server-side from the database —
  never trusted from client input — for both bookings and payments.
- Stripe webhook signatures are cryptographically verified before any
  payment status is trusted or applied.
- Payment status updates are idempotent (safe against duplicate webhook
  delivery) and payment-intent reuse prevents duplicate charges on retry.
- `npm audit` reports **0 vulnerabilities** in the dependency tree as of
  this delivery (a vulnerable Nodemailer version was caught and upgraded
  during development).

### Potential risks / things to monitor
- If deployed behind a load balancer/proxy, ensure `trust proxy` (already
  set in `app.js`) matches your actual proxy topology, or rate limiting
  could key off the wrong IP.
- The `0.0.0.0/0` MongoDB Atlas network-access option mentioned in Task 1
  is for **testing only** — restrict it to your server's IP in production.
- No automated dependency-vulnerability scanning is wired into CI yet —
  run `npm audit` periodically.

### Manual security configuration required at deployment
- Restrict MongoDB Atlas network access to your production server's IP.
- Use Stripe **live** keys only once fully tested in test mode.
- Set `NODE_ENV=production` so stack traces are suppressed and Helmet/CORS
  behave in their strictest mode.
- Rotate `JWT_SECRET` if it is ever exposed, and use a long, random value
  in production (not the development placeholder in this repo's `.env`).

### Recommendations for further hardening
- Add a scheduled job to expire unpaid `pending` bookings and release seats.
- Consider short-lived access tokens + refresh-token rotation for
  higher-security deployments.
- Add centralized logging/monitoring (e.g. Sentry, Datadog) for production
  error visibility beyond console logs.
- Add CI-based `npm audit` / Dependabot for ongoing dependency security.

---

*This backend is one part of the full MERN Travel Booking System. The
frontend (React/Vite) is a separate deliverable and is not included in
this ZIP.*
