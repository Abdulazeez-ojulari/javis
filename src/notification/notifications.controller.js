const NotificationModel = require("./notification.model");
const errorMiddleWare = require("../middlewares/error");
const uuid = require("uuid");

exports.Notifications = errorMiddleWare(async (req, res) => {
  const user = req.user;
  const notifications = await NotificationModel.findAll({ recipients: user.id, isRead:false });

  return res.json({
    message: "Notifications fetched successfully",
    data: notifications,
  });
});

exports.acknowledgeNotifications = errorMiddleWare(async (req, res) => {
  const { id } = req.user;
  const { notificationId } = req.params;
  const notification = await NotificationModel.findOne({
    recipients: id,
    notificationId,
  });

  if (!notification) {
    return res
      .status(404)
      .json({ message: "Notification not found", dat: notification });
  }

  notification.isRead = true;
  await notification.save();
  return res.json({
    message: "Notifications acknowledged successfully",
    data: notification,
  });
});
