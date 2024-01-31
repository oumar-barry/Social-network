const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const { newPost, likePost } = require('../controllers/PostController');
router.post('/new', protect, newPost);
router.put('/:id/like', protect, likePost);

module.exports = router;
