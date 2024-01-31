const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
	register,
	login,
	follow,
	search,
} = require('../controllers/UserController');
router.post('/register', register);
router.post('/login', login);
router.put('/:userId/follow', protect, follow);
router.post('/search', protect, search);

module.exports = router;
