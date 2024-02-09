const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
	sender: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
	},
	content: String,
	readBy: [
		{
			type: mongoose.Schema.ObjectId,
			ref: 'User',
		},
	],
	chat: {
		type: mongoose.Schema.ObjectId,
		ref: 'Chat',
	},
	removed: {
		type: Boolean,
		default: false,
	},
	postedAt: {
		type: Date,
		default: Date.now(),
	},
});

// To be completed later, this is just for starting the project
module.exports = mongoose.model('Message', MessageSchema);
