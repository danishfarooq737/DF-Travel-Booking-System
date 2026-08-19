/**
 * Wraps an async Express route handler so that any rejected promise / thrown
 * error is automatically forwarded to next(err), where the centralized
 * errorHandler middleware will handle it. Avoids repetitive try/catch blocks
 * in every controller.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
