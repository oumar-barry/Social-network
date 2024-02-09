const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
	unreadNotifications,
} = require('../controllers/NotificationController');

router.get('/unread', protect, unreadNotifications);

module.exports = router;
