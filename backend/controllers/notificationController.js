const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { isValidObjectId } = require('../utils/validators');
const Notification = require('../models/Notification');

// @desc    Get current user's notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id })
    .sort('-createdAt')
    .limit(100);

  res.status(200).json({ success: true, data: { notifications } });
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private (owner only)
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid notification id');
  }

  const notification = await Notification.findById(id);
  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  if (notification.user.toString() !== req.user.id) {
    throw new ApiError(403, 'You are not authorized to modify this notification');
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({ success: true, data: { notification } });
});

module.exports = { getNotifications, markAsRead };
