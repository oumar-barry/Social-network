const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Post = require('../models/Post');
const ErrorResponse = require('../utils/ErrorResponse');
const path = require('path');
const fs = require('fs');

/**
 * @route /api/user/register
 * @desc register a user
 * @access public
 */
const register = asyncHandler(async (req, res, next) => {
	const user = await User.create(req.body);
	const { token, options } = user.generateToken();

	res.cookie('token', token, options);
	res.status(201).json({ data: user });
});

/**
 * @route /api/user/login
 * @desc login a user
 * @access public
 */
const login = asyncHandler(async (req, res, next) => {
	const { credential, password } = req.body;
	const user = await User.findOne({
		$or: [{ username: credential }, { email: credential }],
	});

	if (!user) {
		return next(new ErrorResponse('Invalid credentials / password ', 404));
	}

	if (!(await user.matchPassword(password))) {
		return next(new ErrorResponse('Invalid credentials / password ', 404));
	}

	const { token, options } = user.generateToken();

	res.cookie('token', token, options);
	res.status(201).json({ data: user });
});

/**
 * @route PUT /api/user/:userId/follow
 * @desc follow or unfollow a user
 * @access private
 */
const follow = asyncHandler(async (req, res, next) => {
	let user = await User.findById(req.params.userId);
	if (!user) {
		return next(new ErrorResponse('user not found ', 404));
	}

	if (req.user._id == req.params.userId) {
		return next(new ErrorResponse("You can't follow yourself ", 400));
	}

	const isFollowing = req.user.following.includes(user._id);
	const pushOrPull = isFollowing ? '$pull' : '$push';
	req.user = await User.findByIdAndUpdate(
		req.user.id,
		{
			[pushOrPull]: { following: req.params.userId },
		},
		{ new: true }
	);

	user = await User.findByIdAndUpdate(
		user._id,
		{
			[pushOrPull]: { followers: req.user._id },
		},
		{ new: true }
	);

	//Send notification later

	//Only return the current logged in user later
	res.status(200).json({ data: { user, me: req.user } });
});

/**
 * @route POST /api/user/search
 * @desc search for a user
 * @access private
 */
const search = asyncHandler(async (req, res, next) => {
	const searchTerm = req.query.term;
	const results = await User.find({
		$or: [
			{ username: { $regex: searchTerm, $options: 'i' } },
			{ firstname: { $regex: searchTerm, $options: 'i' } },
		],
	});

	res.status(200).json({ data: results });
});

/**
 * @route POST /api/user/newsfeed
 * @desc get logged in user newsfeed
 * @access private
 */
const newsfeed = asyncHandler(async (req, res, next) => {
	let followingIds = [];
	if (req.user.following && req.user.following.length != 0) {
		followingIds = req.user.following.map((user) => user.toString());
		followingIds.push(req.user._id.toString());
	}

	const results = await Post.find({
		user: { $in: followingIds },
	})
		.populate('user')
		.populate('replyTo')
		.populate('retweet')
		.sort({ postedOn: -1 });

	res.status(200).json({ data: results });
});

/**
 * @route GET /api/user/me
 * @desc get logged in user profile
 * @access private
 */
const getMe = asyncHandler(async (req, res, next) => {
	// perform later a find and populate fields if needed
	const following = req.user.following.length;
	const followers = req.user.followers.length;
	const posts = req.user.posts.length;
	const retweets = req.user.retweets.length;
	res
		.status(200)
		.json({ data: req.user, following, followers, posts, retweets });
});

/**
 * @route GET /api/user/:userId/profile
 * @desc get a user profile
 * @access private
 */
const getProfile = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.params.userId);
	if (!user) {
		return next(new ErrorResponse('User not found ', 404));
	}
	res.status(200).json({ data: user });
});

/**
 * @route GET /api/user/:userId/following
 * @desc get a user's following
 * @access private
 */
const getFollowing = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.params.userId).populate('following');
	if (!user) {
		return next(new ErrorResponse('User not found ', 404));
	}
	res.status(200).json({ data: user.following });
});

/**
 * @route GET /api/user/:userId/followers
 * @desc get a user's followers
 * @access private
 */
const getFollowers = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.params.userId).populate('followers');
	if (!user) {
		return next(new ErrorResponse('User not found ', 404));
	}
	res.status(200).json({ data: user.followers });
});

/**
 * @route POST /api/user/upload/profile-picture
 * @desc upload a profile picture
 * @access private
 */
const uploadProfilePicture = asyncHandler(async (req, res, next) => {
	if (req.file.size > process.env.MAX_PROFILE_PICTURE_SIZE) {
		return next(new ErrorResponse('Only 10MB file size is allowed ', 400));
	}

	if (!req.file.mimetype.startsWith('image/')) {
		return next(new ErrorResponse('Please select an image ', 400));
	}

	const filePath = `${req.file.path}-${Date.now()}${path.extname(
		req.file.originalname
	)}`;

	const tempPath = req.file.path;
	const targetPath = path.join(__dirname, '../', filePath);
	fs.rename(tempPath, targetPath, async (error) => {
		if (error) {
			return next(
				new ErrorResponse('Somethign went wrong while uploading ', 400)
			);
		}

		req.user = await User.findByIdAndUpdate(
			req.user._id,
			{ profile: filePath },
			{ new: true }
		);

		res.status(200).sendFile(path.join(__dirname, '../', filePath));
	});
});

/**
 * @route POST /api/user/upload/cover-picture
 * @desc upload a cover picture
 * @access private
 */
const uploadCoverPicture = asyncHandler(async (req, res, next) => {
	if (req.file.size > process.env.MAX_PROFILE_PICTURE_SIZE) {
		return next(new ErrorResponse('Only 10MB file size is allowed ', 400));
	}

	if (!req.file.mimetype.startsWith('image/')) {
		return next(new ErrorResponse('Please select an image ', 400));
	}

	const filePath = `${req.file.path}-${Date.now()}${path.extname(
		req.file.originalname
	)}`;

	const tempPath = req.file.path;
	const targetPath = path.join(__dirname, '../', filePath);
	fs.rename(tempPath, targetPath, async (error) => {
		if (error) {
			return next(
				new ErrorResponse('Somethign went wrong while uploading ', 400)
			);
		}

		req.user = await User.findByIdAndUpdate(
			req.user._id,
			{ cover: filePath },
			{ new: true }
		);

		res.status(200).sendFile(path.join(__dirname, '../', filePath));
	});
});

module.exports = {
	register,
	login,
	follow,
	search,
	newsfeed,
	getMe,
	getProfile,
	getFollowing,
	getFollowers,
	uploadProfilePicture,
	uploadCoverPicture,
};
