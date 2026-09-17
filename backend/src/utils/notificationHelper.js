import Notification from '../models/Notification.js';

/**
 * Utility helper to create a system notification for a specific user
 * @param {Object} params - { userId, type, title, message, relatedEntityId, relatedEntityType }
 */
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  relatedEntityId = null,
  relatedEntityType = null,
}) => {
  try {
    if (!userId || !type || !title || !message) {
      console.warn('[Notification] Skipping notification creation: missing required parameters');
      return null;
    }

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      relatedEntityId,
      relatedEntityType,
    });

    return notification;
  } catch (error) {
    console.error(`[Notification Error] Failed to create notification: ${error.message}`);
    return null;
  }
};
