const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
	register,
	login,
	follow,
	search,
	newsfeed,
	getMe,
	getProfile,
} = require('../controllers/UserController');
router.post('/register', register);
router.post('/login', login);
router.put('/:userId/follow', protect, follow);
router.post('/search', protect, search);
router.get('/newsfeed', protect, newsfeed);
router.get('/me', protect, getMe);
router.get('/:userId/profile', protect, getProfile);

module.exports = router;
