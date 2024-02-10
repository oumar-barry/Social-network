const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
	sender: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
	},
	content: {
		type: String,
		//required: [true, 'The content of the message is required '],
	},
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

MessageSchema.pre('find', function () {
	this.populate({ path: 'chat', select: 'title' }).populate(
		'sender',
		'firstname lastname username profile'
	);
});

// To be completed later, this is just for starting the project
module.exports = mongoose.model('Message', MessageSchema);
