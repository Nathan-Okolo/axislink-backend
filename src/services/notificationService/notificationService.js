import { NotFoundError } from "../../lib/appErrors.js";
import notificationModel from "../../models/notificationModel.js";

export const fetchNotificaitons = async ({ user }) => {
  const unread_notifications = await notificationModel.countDocuments({
    user_id: user._id,
    is_read: false,
  });

  const notifications = await notificationModel
    .find({
      user_id: user._id,
    })
    .sort({ createdAt: -1 });

  for (let notification of notifications) {
    notification.is_read = true;

    await notification.save();
  }

  return { unread_notifications, notifications };
};

export const markAsReadNotification = async ({ user, notification_id }) => {
  const data = await notificationModel.findOne({
    user_id: user._id,
    _id: notification_id,
  });
  console.log(data);
  const notification = await notificationModel.deleteOne({
    user_id: user._id,
    _id: notification_id,
  });

  if (notification.deletedCount === 0) {
    throw new NotFoundError("Notification not found");
  }

  return data;
};
