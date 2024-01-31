const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const ErrorResponse = require('../utils/ErrorResponse');

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

module.exports = {
	register,
	login,
	follow,
	search,
};
