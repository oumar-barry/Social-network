const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const { register, login, follow } = require('../controllers/UserController');
router.post('/register', register);
router.post('/login', login);
router.put('/:userId/follow', protect, follow);

module.exports = router;
