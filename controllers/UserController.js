const asyncHandler = require('express-async-handler');
const User = require('../models/User');

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
const login = asyncHandler(async (req, res, next) => {});

module.exports = {
	register,
};
