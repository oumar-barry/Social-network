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

module.exports = {
	register,
	login,
};
