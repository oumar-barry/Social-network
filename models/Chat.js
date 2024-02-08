const mongoose = require('mongoose');
const ChatSchema = new mongoose.Schema(
	{
		title: String,
		users: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'User',
			},
		],
		lastMessage: {
			type: mongoose.Schema.ObjectId,
			ref: 'Message',
		},
		groupChat: {
			type: Boolean,
			default: false,
		},
		createdBy: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
		},
	},
	{
		timestamps: true,
	}
);

// To be completed later, this is just for starting the project
module.exports = mongoose.model('Chat', ChatSchema);
