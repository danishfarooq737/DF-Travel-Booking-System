const express = require('express');
const { body, query } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const {
  getAllTravel,
  getTravelById,
  createTravel,
  updateTravel,
  deleteTravel,
} = require('../controllers/travelController');

const router = express.Router();

router.get(
  '/',
  [
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 }),
    query('travelers').optional().isInt({ min: 1 }),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  validate,
  getAllTravel
);

router.get('/:id', getTravelById);

const travelValidationRules = [
  body('title').trim().isLength({ min: 3, max: 150 }).withMessage('Title must be 3-150 characters'),
  body('destination').trim().notEmpty().withMessage('Destination is required'),
  body('departureCity').trim().notEmpty().withMessage('Departure city is required'),
  body('description').trim().isLength({ min: 10, max: 3000 }).withMessage('Description must be 10-3000 characters'),
  body('travelType').optional().isIn(['flight', 'hotel', 'package', 'tour', 'cruise']),
  body('departureDate').isISO8601().withMessage('A valid departure date is required'),
  body('returnDate').optional().isISO8601(),
  body('durationDays').isInt({ min: 1 }).withMessage('Duration must be at least 1 day'),
  body('totalSeats').isInt({ min: 1 }).withMessage('Total seats must be at least 1'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('currency').optional().isLength({ min: 3, max: 3 }),
  body('images').optional().isArray(),
];

router.post('/', protect, authorize('admin'), travelValidationRules, validate, createTravel);
router.put('/:id', protect, authorize('admin'), validate, updateTravel);
router.delete('/:id', protect, authorize('admin'), deleteTravel);

module.exports = router;
