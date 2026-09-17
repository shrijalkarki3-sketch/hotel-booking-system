import Notification from '../models/Notification.js';

/**
 * @desc    Get user notifications and unread count
 * @route   GET /api/v1/notifications
 * @access  Private (All Authenticated Users)
 */
export const getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const startIndex = (page - 1) * limit;

    const userId = req.user._id;

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });
    const total = await Notification.countDocuments({ userId });

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      unreadCount,
      total,
      count: notifications.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a single notification as read
 * @route   PATCH /api/v1/notifications/:id/read
 * @access  Private (Owner User)
 */
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - You cannot modify another user’s notification',
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all unread notifications as read for logged in user
 * @route   PATCH /api/v1/notifications/read-all
 * @access  Private (All Authenticated Users)
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany({ userId, isRead: false }, { isRead: true });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};
