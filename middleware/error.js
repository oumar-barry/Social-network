const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('express-async-handler');
/**
 * A middleware that intercepts mongoose errors for validation
 *
 */
exports.errorHandler = asyncHandler((req, res, next) => {
	console.log('printing the errors ');
	console.log(err);

	let error = { ...err };

	error.message = err.message;
	let message;

	//check for cast error
	if (err.name == 'CastError') {
		message = 'Resource not found ';
		error = new ErrorResponse(message, 404);
	}

	// get all validation errors
	if (err.name == 'ValidationError') {
		message = Object.values(err.errors).map((val) => val.message);
		error = new ErrorResponse(message, 400);
	}

	// Check for duplicate fileds
	if (err.code == 11000) {
		message = 'Duplicate field value entered ';
		error = new ErrorResponse(message, 400);
	}

	res.status(error.statusCode || 500).json({
		success: false,
		error: error.message || 'Internale server error ',
	});
});
