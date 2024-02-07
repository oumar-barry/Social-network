const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
	newChat,
	sendMessage,
	getChat,
	addUsers,
} = require('../controllers/ChatController');

router.post('/new-chat', protect, newChat);
router.post('/:id', protect, sendMessage);
router.get('/:id', protect, getChat);
router.get('/:id/add-user', protect, addUsers);

module.exports = router;
