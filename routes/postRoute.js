const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
	newPost,
	likePost,
	deletePost,
	commentPost,
	retweetPost,
	search,
} = require('../controllers/PostController');
router.post('/new', protect, newPost);
router.post('/:id/comment', protect, commentPost);
router.post('/:id/retweet', protect, retweetPost);
router.put('/:id/like', protect, likePost);
router.delete('/:id', protect, deletePost);
router.post('/search', protect, search);

module.exports = router;
