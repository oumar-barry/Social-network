const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const Post = require('../models/Post');

/**
 * @route GET /api/notification/unread
 * @desc get unread notifications of the logged in user
 * @access private
 */
const unreadNotifications = asyncHandler(async (req, res, next) => {
	let notifications = await Notification.find({
		to: req.user.id,
		opened: false,
	}); //.sort('-createdAt');

	let results = [];
	notifications = await Promise.all(
		notifications.map(async (n) => {
			if (n.notificationType == 'like') {
				n = await Notification.populate(n, {
					path: 'instance',
					model: 'Post',
				});
			} else if (n.notificationType == 'new message') {
				n = await Notification.populate(n, {
					path: 'instance',
					model: 'Chat',
					populate: {
						path: 'lastMessage',
					},
				});
			}
			results.push(n);
		})
	);

	/* let likeNotifications = await Notification.find({
		to: req.user.id,
		opened: { $eq: false },
	})
		.populate({
			path: 'instance',
			match: { notificationType: { $eq: 'like' } },
			model: 'Post',
		})
		.exec();

	let newMessageNotifications = await Notification.find({
		notificationType: 'new message',
		to: req.user.id,
		opened: { $eq: false },
	}).populate({
		path: 'instance',
		model: 'Chat',
		populate: {
			path: 'lastMessage',
		},
	});

	const notifications = { ...likeNotifications }; */

	res.status(200).json({ data: results });
});

module.exports = {
	unreadNotifications,
};
