const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
	newChat,
	sendMessage,
	getChat,
	addUsers,
	getInbox,
	getLastMessage,
	deleteMessage,
	leaveChat,
	updateChatTitle,
	unreadMessages,
} = require('../controllers/ChatController');

router.get('/unread-messages', protect, unreadMessages);
router.get('/inbox', protect, getInbox);
router.post('/new-chat', protect, newChat);
router.post('/:id', protect, sendMessage);
router.get('/:id', protect, getChat);
router.get('/:id/add-user', protect, addUsers);
router.get('/:id/last-message', protect, getLastMessage);
router.delete('/:messageId/delete-message', protect, deleteMessage);
router.put('/:id/leave', protect, leaveChat);
router.put('/:id/update-title', protect, updateChatTitle);

module.exports = router;
