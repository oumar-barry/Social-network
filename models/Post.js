const mongoose = require('mongoose');
const PostSchema = new mongoose.Schema({
	user: {
		type: mongoose.Types.ObjectId,
		ref: 'User',
	},
	content: String,
	images: [String],
	postedOn: {
		type: Date,
		default: Date.now(),
	},
	likes: [
		{
			type: mongoose.Schema.ObjectId,
			ref: 'User',
		},
	],
	replyTo: {
		type: mongoose.Schema.ObjectId,
		ref: 'Post',
	},
	retweet: {
		type: mongoose.Schema.ObjectId,
		ref: 'Post',
	},
	retweetUsers: [
		{
			type: mongoose.Schema.ObjectId,
			ref: 'User',
		},
	],
});

// To be completed later, this is just for starting the project
module.exports = mongoose.model('Post', PostSchema);
