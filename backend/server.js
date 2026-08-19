require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  // Gracefully handle unexpected errors instead of crashing silently.
  process.on('unhandledRejection', (err) => {
    // eslint-disable-next-line no-console
    console.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });

  process.on('SIGTERM', () => {
    // eslint-disable-next-line no-console
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => process.exit(0));
  });
};

start();
