const mongoose = require('mongoose');

/**
 * Returns true if the given value is a syntactically valid MongoDB ObjectId.
 * Used to defend against malformed / malicious :id route params before they
 * ever reach a Mongoose query (prevents CastError leaks and is one layer of
 * NoSQL-injection defense).
 */
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

/**
 * Generates a human-readable, reasonably unique booking reference such as
 * "TB-9K3F2A7Q". Not cryptographically sensitive - just a display reference.
 */
const generateBookingReference = () => {
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `TB-${random}`;
};

module.exports = { isValidObjectId, generateBookingReference };
