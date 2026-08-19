const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { isValidObjectId } = require('../utils/validators');
const Travel = require('../models/Travel');

// @desc    Get all travel listings with search/filter/pagination
// @route   GET /api/travel
// @access  Public
const getAllTravel = asyncHandler(async (req, res) => {
  const {
    destination,
    minPrice,
    maxPrice,
    travelType,
    travelers,
    dateFrom,
    dateTo,
    page = 1,
    limit = 12,
    sort = '-createdAt',
  } = req.query;

  const query = { status: 'active' };

  if (destination) {
    query.destination = { $regex: String(destination), $options: 'i' };
  }

  if (travelType) {
    query.travelType = travelType;
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (travelers) {
    query.availableSeats = { $gte: Number(travelers) };
  }

  if (dateFrom || dateTo) {
    query.departureDate = {};
    if (dateFrom) query.departureDate.$gte = new Date(dateFrom);
    if (dateTo) query.departureDate.$lte = new Date(dateTo);
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Travel.find(query).sort(sort).skip(skip).limit(limitNum),
    Travel.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: {
      items,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    },
  });
});

// @desc    Get single travel listing by id
// @route   GET /api/travel/:id
// @access  Public
const getTravelById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid travel id');
  }

  const travel = await Travel.findById(id);
  if (!travel) {
    throw new ApiError(404, 'Travel listing not found');
  }

  res.status(200).json({ success: true, data: { travel } });
});

// @desc    Create a travel listing
// @route   POST /api/travel
// @access  Private/Admin
const createTravel = asyncHandler(async (req, res) => {
  const payload = { ...req.body, createdBy: req.user.id };

  // availableSeats always starts equal to totalSeats on creation,
  // regardless of what the client sends.
  payload.availableSeats = payload.totalSeats;

  const travel = await Travel.create(payload);

  res.status(201).json({ success: true, message: 'Travel listing created', data: { travel } });
});

// @desc    Update a travel listing
// @route   PUT /api/travel/:id
// @access  Private/Admin
const updateTravel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid travel id');
  }

  const travel = await Travel.findById(id);
  if (!travel) {
    throw new ApiError(404, 'Travel listing not found');
  }

  const allowedFields = [
    'title',
    'destination',
    'departureCity',
    'description',
    'images',
    'travelType',
    'departureDate',
    'returnDate',
    'durationDays',
    'totalSeats',
    'price',
    'currency',
    'status',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      travel[field] = req.body[field];
    }
  });

  // If totalSeats increased, increase availableSeats by the same delta so
  // we never silently overbook or under-book from an admin edit.
  if (req.body.totalSeats !== undefined) {
    const previousTotal = travel.totalSeats;
    const delta = req.body.totalSeats - previousTotal;
    travel.availableSeats = Math.max(0, travel.availableSeats + delta);
  }

  await travel.save();

  res.status(200).json({ success: true, message: 'Travel listing updated', data: { travel } });
});

// @desc    Delete a travel listing
// @route   DELETE /api/travel/:id
// @access  Private/Admin
const deleteTravel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid travel id');
  }

  const travel = await Travel.findByIdAndDelete(id);
  if (!travel) {
    throw new ApiError(404, 'Travel listing not found');
  }

  res.status(200).json({ success: true, message: 'Travel listing deleted' });
});

module.exports = { getAllTravel, getTravelById, createTravel, updateTravel, deleteTravel };
