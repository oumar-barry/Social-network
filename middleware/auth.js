const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// middleware that checks the validity of a token before accessing private routes
exports.protect = asyncHandler(async (req, res, next) => {
	let token;
	if (req.cookies && req.cookies.token != '') {
		token = req.cookies.token;
	}

	if (!token) return next(new ErrorResponse('Unauthorized request', 401));

	try {
		const decoded = jwt.verify(token, process.env.  JWT_SECRET);
		req.user = await User.findById(decoded.id);

		next();
	} catch (err) {
		return next(new ErrorResponse('Unauthorized request, bad token', 401));
	}
});
