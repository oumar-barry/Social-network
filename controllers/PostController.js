const asyncHandler = require('express-async-handler');
const Post = require('../models/Post');
const ErrorResponse = require('../utils/ErrorResponse');

/**
 * @route POST /api/post/new
 * @desc create a new post
 * @access private
 */
const newPost = asyncHandler(async (req, res, next) => {
	req.body.user = req.user._id;
	// handle single or multiple image upload later
	const post = await Post.create(req.body);
	res.status(201).json({ data: post });
});

/**
 * @route PUT /api/post/:id/like
 * @desc like or unlike a post
 * @access private
 */
const likePost = asyncHandler(async (req, res, next) => {
	//check if post exists
	const post = await Post.findById(req.params.id);
	if (!post) return next(new ErrorResponse('Post not found', 404));

	if (post.likes.includes(req.user._id)) {
		post.likes = post.likes.filter((user) => {
			user.toString() == req.user._id;
		});
	} else {
		post.likes.unshift(req.user._id);
	}

	await post.save();

	res.status(201).json({ data: post });
});

module.exports = {
	newPost,
	likePost,
};
