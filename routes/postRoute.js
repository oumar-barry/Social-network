const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
	newPost,
	likePost,
	deletePost,
	commentPost,
} = require('../controllers/PostController');
router.post('/new', protect, newPost);
router.post('/:id/comment', protect, commentPost);
router.put('/:id/like', protect, likePost);
router.delete('/:id', protect, deletePost);

module.exports = router;
