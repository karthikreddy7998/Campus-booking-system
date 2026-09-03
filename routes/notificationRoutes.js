const express = require("express");
const router = express.Router();
const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} = require("../controllers/notificationController");

router.get("/:userId", getMyNotifications);
router.get("/unread/:userId", getUnreadCount);
router.put("/read/:id", markAsRead);
router.put("/read-all/:userId", markAllAsRead);

module.exports = router;
