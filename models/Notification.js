const mongoose = require('mongoose');
const NotificationSchema = new mongoose.Schema(
	{
		notificationType: {
			type: String,
			enum: [
				'like',
				'follow',
				'new message',
				'retweet',
				'left chat',
				'comment',
				'added to chat',
			],
		},
		from: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
		},
		to: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
		},
		instance: {
			type: mongoose.Schema.ObjectId,
		},
		opened: {
			type: Boolean,
			default: false,
		},
	},

	{
		timestamps: true,
	}
);

NotificationSchema.statics.insert = async function (
	from,
	to,
	notificationType,
	instance
) {
	try {
		const notification = new this({
			from,
			to,
			notificationType,
			instance,
		});
		await notification.save();
	} catch (err) {
		throw err;
	}
};

module.exports = mongoose.model('Notification', NotificationSchema);
