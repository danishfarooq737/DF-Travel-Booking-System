const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');

const corsOptions = require('./config/corsOptions');
const { apiLimiter } = require('./middleware/rateLimiter');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const { handleWebhook } = require('./controllers/paymentController');

const authRoutes = require('./routes/authRoutes');
const travelRoutes = require('./routes/travelRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Trust the first proxy hop (Render/Heroku/Nginx etc.) so req.ip and
// rate-limiting see the real client IP instead of the proxy's IP.
app.set('trust proxy', 1);

// --- Security headers -------------------------------------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// --- CORS ---------------------------------------------------------------
app.use(cors(corsOptions));

// --- Stripe webhook: MUST be registered BEFORE express.json(), because
// Stripe signature verification requires the raw request body. -----------
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// --- Standard body parsing (after the webhook route above) --------------
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// --- Prevent NoSQL injection via query/body/params operator injection ---
app.use(mongoSanitize());

// --- Compression + logging ----------------------------------------------
app.use(compression());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// --- General API rate limiting -------------------------------------------
app.use('/api', apiLimiter);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend API is running',
  });
});

// --- Health check (useful for uptime monitors / deployment platforms) ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy', timestamp: new Date().toISOString() });
});

// --- Routes ---------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/travel', travelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// --- 404 + centralized error handler (must be last) -----------------------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
