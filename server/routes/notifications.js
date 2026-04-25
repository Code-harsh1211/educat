// routes/notifications.js
const express = require('express');
const router = express.Router();
const { getNotifications, markNotificationRead } = require('../controllers/otherControllers');
const { protect } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markNotificationRead);

module.exports = router;
