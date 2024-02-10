const asyncHandler = require('express-async-handler');
const Post = require('../models/Post');
const ErrorResponse = require('../utils/ErrorResponse');
const User = require('../models/User');
const Notification = require('../models/Notification');
const path = require('path');
const fs = require('fs');

/**
 * @route POST /api/post/new
 * @desc create a new post
 * @access private
 */
const newPost = asyncHandler(async (req, res, next) => {
	if (req.body.content.trim() == '' && req.files.length == 0) {
		return next(
			new ErrorResponse(
				'Please provide a content or at least one image for a new post',
				400
			)
		);
	}

	// handle single or multiple image upload later
	let post = new Post({
		user: req.user.id,
		content: req.body.content,
	});

	// this counter is going to help us for handling the error
	//instead of using the break keyword inside of our loop
	let counter = 0;
	let imagesToUpload = [];
	if (req.files.length != 0) {
		req.files.forEach((file, index) => {
			console.log(file);
			if (!file.mimetype.startsWith('image/')) {
				return next(
					new ErrorResponse(`Please select an image, element ${index + 1}`, 400)
				);
			}

			let filePath = `${file.path}-${Date.now()}${path.extname(
				file.originalname
			)}`;

			let tempPath = file.path;
			let targetPath = path.join(__dirname, '../', filePath);

			imagesToUpload.unshift({ tempPath, targetPath });
			post.images.unshift(filePath.replace('uploads/', ''));
			counter++;
		});
	}

	if (req.files.length != 0 && counter == req.files.length) {
		//upload images before saving the post
		imagesToUpload.forEach(({ tempPath, targetPath }) => {
			fs.rename(tempPath, targetPath, async (error) => {
				if (error) {
					return next(
						new ErrorResponse('Somethign went wrong while uploading ', 400)
					);
				}
			});
		});

		await post.save();
		res.status(201).json({ data: post });
	} else if (req.files.length == 0 && post.content != '') {
		await post.save();
		res.status(201).json({ data: post });
	}
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
		Notification.insert(req.user.id, post.user, 'like', post.id);
	}

	await post.save();

	res.status(200).json({ data: post });
});

/**
 * @route DELETE /api/post/:id
 * @desc delete a post
 * @access private
 */
const deletePost = asyncHandler(async (req, res, next) => {
	//check if post exists
	const post = await Post.findById(req.params.id);
	if (!post) return next(new ErrorResponse('Post not found', 404));

	if (post.user.toString() != req.user._id) {
		return next(
			new ErrorResponse(
				"You can't delete this post, operation reserved to the owner",
				403
			)
		);
	}

	await Post.findByIdAndDelete(post._id);

	res.status(204).json({ data: {} });
});

/**
 * @route POST /api/post/:id/comment
 * @desc comment a post
 * @access private
 */
const commentPost = asyncHandler(async (req, res, next) => {
	//check if post exists
	const post = await Post.findById(req.params.id);
	if (!post) return next(new ErrorResponse('Post not found', 404));
	req.body.user = req.user._id;
	req.body.replyTo = req.params.id;

	const newPost = await Post.create(req.body);
	if (req.params.id) {
		Notification.insert(req.user.id, post.user, 'comment', post.id);
	}
	res.status(201).json({ data: newPost });
});

/**
 * @route POST /api/post/:id/retweet
 * @desc retweet a post
 * @access private
 */
const retweetPost = asyncHandler(async (req, res, next) => {
	//check if post exists
	let post = await Post.findById(req.params.id);
	if (!post) return next(new ErrorResponse('Post not found', 404));

	//check if the user has already retweeted the post
	if (!req.user.retweets.includes(req.params.id)) {
		req.body.user = req.user._id;
		req.body.retweet = req.params.id;
		Post.create(req.body).then(async (newPost) => {
			newPost.populate('retweet');
			req.user = await User.findByIdAndUpdate(
				req.user._id,
				{
					$push: { retweets: newPost.retweet },
				},
				{ new: true }
			);

			post = await Post.findByIdAndUpdate(
				req.params.id,
				{
					$push: { retweetUsers: req.user._id },
				},
				{ new: true }
			);

			//return only the new post later in prod
			return res.status(201).json({ data: { post, newPost, user: req.user } });
		});
	} else {
		return next(new ErrorResponse("You've already retweeted this post ", 400));
	}
});

/**
 * @route POST /api/post/search
 * @desc search for a post
 * @access private
 */
const search = asyncHandler(async (req, res, next) => {
	const searchTerm = req.query.term;
	const results = await Post.find({
		$or: [{ content: { $regex: searchTerm, $options: 'i' } }],
	});

	res.status(200).json({ data: results });
});

module.exports = {
	newPost,
	likePost,
	deletePost,
	commentPost,
	retweetPost,
	search,
};
