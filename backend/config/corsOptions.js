/**
 * CORS configuration.
 *
 * Security requirement: never use a wildcard "*" origin for an authenticated
 * API. CORS_ORIGIN in .env is a comma-separated allow-list, e.g.:
 *   CORS_ORIGIN=http://localhost:5173,https://your-frontend.example.com
 */
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, server-to-server,
    // Postman) — there is no browser "origin" to validate in that case.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin "${origin}" is not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false, // bearer tokens are used, not cookies
  maxAge: 600,
};

module.exports = corsOptions;
