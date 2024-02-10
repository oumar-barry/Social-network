const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema(
	{
		firstname: {
			type: String,
			required: [true, 'firstname is required '],
			trim: true,
			minLength: [2, 'The firstname must contain at least 2 characters '],
			maxLength: [50, 'The firstname must contain at most 50 characters '],
		},
		lastname: {
			type: String,
			required: [true, 'The lastname is required '],
			trim: true,
			minLength: [2, 'The lastname must contain at least 2 characters '],
			maxLength: [50, 'The lastname must contain at most 50 characters '],
		},
		username: {
			type: String,
			required: [true, 'The username is required '],
			trim: true,
			unique: [true, 'This username is already taken '],
		},
		email: {
			type: String,
			required: [true, 'The email is required '],
			trim: true,
			unique: [true, 'This email already taken '],
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				'Please add a valid email',
			],
		},
		password: {
			type: String,
			require: [true, 'password is required '],
			minLength: [2, 'Password must be at least 2 characters '],
			maxLength: [100, 'Password must be at most 100 characters '],
		},
		following: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'User',
			},
		],
		followers: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'User',
			},
		],
		posts: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'Post',
			},
		],
		likes: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'Post',
			},
		],
		retweets: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'Post',
			},
		],
		profile: {
			type: String,
			default: 'profile.png',
		},
		cover: {
			type: String,
			default: 'cover.png',
		},
		createdAt: {
			type: Date,
			default: Date.now(),
		},
		resetPasswordToken: {
			type: String,
			select: false,
		},
		resetPasswordExpire: {
			type: Date,
			select: false,
		},
		closed: {
			type: Boolean,
			default: false,
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

UserSchema.methods.generateToken = function () {
	const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	});

	const options = {
		expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
		httpOnly: true,
	};

	if (process.env.NODE_ENV == 'production') {
		options.secure = true;
	}

	return { token, options };
};

UserSchema.methods.matchPassword = async function (password) {
	return await bcrypt.compare(password, this.password);
};

UserSchema.methods.getResetPasswordToken = function () {
	const token = crypto.randomBytes(20).toString('hex');
	this.resetPasswordToken = crypto
		.createHash('sha256')
		.update(token)
		.digest('hex');
	this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
	return token;
};

UserSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		this.resetPasswordToken = null;
		this.resetPasswordExpire = null;
	}
	next();
});

module.exports = mongoose.model('User', UserSchema);
