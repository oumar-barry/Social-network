const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const { register, login } = require('../controllers/UserController');
router.post('/register', register);
router.post('/login', login);
module.exports = router;
