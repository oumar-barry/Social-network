const asyncHandler = require('express-async-handler');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const ErrorResponse = require('../utils/ErrorResponse');
const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * @route POST /api/chat/new-chat
 * @desc start a group or regular chat
 * @access private
 */
const newChat = asyncHandler(async (req, res, next) => {
	let { users, title } = req.body;
	users.push(req.user._id);
	const data = {
		title,
		users,
		groupChat: true,
		createdBy: req.user.id,
	};

	let chat = await Chat.create(data);
	//notify chat users
	await Promise.all(
		chat.users.map((chatUser) => {
			if (chatUser.toString() != req.user.id) {
				Notification.insert(req.user.id, chatUser, 'added to chat', chat.id);
			}
		})
	);

	chat = await Chat.populate(chat, {
		path: 'users',
		select: 'firstname lastname username profile',
	});

	res.status(200).json({ data: chat });
});

/**
 * @route POST /api/chat/:id
 * @desc Send a message to an existing group or create a new chat between only 2 users
 * @access private
 */
const sendMessage = asyncHandler(async (req, res, next) => {
	if (req.user.id == req.params.id) {
		return next(
			new ErrorResponse("You can't start a conversation with yourself ", 403)
		);
	}
	let chat = await Chat.findOneAndUpdate(
		{
			_id: req.params.id,
		},
		{
			users: [req.params.id, req.user.id],
		},
		{
			new: true,
			upsert: true,
			setDefaultOnInsert: true,
		}
	);

	//check later if the user is part of the group chat, if not he cna't send a message

	let message = new Message({
		sender: req.user._id,
		content: req.body.content,
		chat: chat._id,
		readBy: req.user._id,
	});

	await message.save();

	message = await Message.populate(message, {
		path: 'readBy',
		select: 'profile',
	});

	chat.lastMessage = message._id;
	await chat.save();
	//Notify user(s) for new message
	await Promise.all(
		chat.users.map((chatUser) => {
			if (chatUser.toString() != req.user.id) {
				Notification.insert(req.user.id, chatUser, 'new message', chat.id);
			}
		})
	);

	res.status(200).json({ data: message });
});

/**
 * @route GET /api/chat/:id
 * @desc get chat data
 * @access private
 */
const getChat = asyncHandler(async (req, res, next) => {
	let chat = await Chat.findOne({
		_id: req.params.id,
		users: { $in: [req.user.id] },
	});

	if (!chat) {
		return next(new ErrorResponse('Chat not found ', 404));
	}

	chat = await User.populate(chat, {
		path: 'users',
		select: 'firstname lastname username profile',
	});

	chat = await Message.populate(chat, { path: 'lastMessage' });
	//mark all chat messages as readk
	await Message.updateMany(
		{ chat: chat.id },
		{ $addToSet: { readBy: req.user.id } }
	);
	res.status(200).json({ data: chat });
});

/**
 * @route POST /api/chat/:id/add-user
 * @desc Add user(s) to an existing group chat conversation
 * @access private
 */
const addUsers = asyncHandler(async (req, res, next) => {
	let chat = await Chat.findById(req.params.id);
	if (!chat) {
		return next(new ErrorResponse('Chat not found ', 404));
	}

	//this variable helps us to avoid the response header already sent error
	let error = '';
	await Promise.all(
		req.body.users.map(async (user) => {
			let foundUser = await User.findById(user);
			if (!foundUser) {
				error = `User ${user} is not found`;
			} else if (chat.users.some((u) => u.toString() == foundUser.id)) {
				console.log('yeah ');
				error = `User ${user} is already in the chat`;
			}

			if (error != '') {
				console.log(error);
				return;
			} else {
				chat.users.push(user);
			}
		})
	);

	if (error !== '') {
		return next(new ErrorResponse(error, 403));
	} else {
		await chat.save();
		return res.status(200).json({ data: chat });
	}
});

/**
 * @route GET /api/chat/inbox
 * @desc get the logged in user inbox
 * @access private
 */
const getInbox = asyncHandler(async (req, res, next) => {
	const inbox = await Chat.find({
		users: { $in: req.user.id },
	})
		.populate({ path: 'users', select: 'firstname lastname username profile' })
		/*.populate({
			path: 'lastMessage',
			populate: {
				path: 'sender',
				select: 'firstname lastname username profile',
				model: 'User',
			},
		})*/
		.sort({ updatedAt: -1 });

	res.status(200).json({ data: inbox });
});

/**
 * @route GET /api/chat/:id/last-message
 * @desc get the last message from of a chat
 * @access private
 */
const getLastMessage = asyncHandler(async (req, res, next) => {
	const chat = await Chat.findById(req.params.id);
	if (!chat) {
		return next(new ErrorResponse('Chat not found ', 404));
	}

	//if his not part of the chat
	if (!chat.users.some((user) => user.toString() == req.user.id)) {
		return next(
			new ErrorResponse('User is not is a member of this chat ', 403)
		);
	}

	const message = await Message.findById(chat.lastMessage).populate({
		path: 'sender',
		select: 'firstname lastname username profile',
	});

	res.status(200).json({ data: message });
});

/**
 * @route PELETE /api/chat/:messageId/delete-message
 * @desc delete a message
 * @access private
 */
const deleteMessage = asyncHandler(async (req, res, next) => {
	let message = await Message.findById(req.params.messageId).populate({
		path: 'sender',
	});

	if (!message) {
		return next(new ErrorResponse('Message not found ', 404));
	}
	console.log(message.sender.id);

	if (message.sender.id != req.user.id) {
		return next(new ErrorResponse('Can only delete your own messages', 403));
	}

	message.removed = true;
	await message.save();

	res.status(204).json({ data: { message } });
});

/**
 * @route PUT /api/chat/:id/leave
 * @desc leave a chat
 * @access private
 */
const leaveChat = asyncHandler(async (req, res, next) => {
	let chat = await Chat.findById(req.params.id).populate({ path: 'users' });
	if (!chat) {
		return next(new ErrorResponse('Chat not found ', 404));
	}

	if (!chat.users.some((user) => user.id == req.user.id)) {
		return next(new ErrorResponse('User is not part of this chat', 404));
	}

	chat = await Chat.findByIdAndUpdate(
		chat._id,
		{ $pull: { users: req.user.id } },
		{ new: true }
	);

	await chat.save();

	//Notify the admin that a user has left the chat
	Notification.insert(req.user.id, chat.createdBy, 'left chat', chat.id);
	res.status(200).json({ data: chat });
});

/**
 * @route PUT /api/chat/:id/update-title
 * @desc update a chat title
 * @access private
 */
const updateChatTitle = asyncHandler(async (req, res, next) => {
	let chat = await Chat.findById(req.params.id);
	if (!chat) {
		return next(new ErrorResponse('Chat not found ', 404));
	}

	if (chat.createdBy.toString() != req.user.id) {
		return next(
			new ErrorResponse("Can't not update chat title, only chat admin", 403)
		);
	}

	chat.title = req.body.title;
	await chat.save();

	res.status(200).json({ data: chat });
});

/**
 * @route GET /api/chat/unread-messages
 * @desc get user's unread messages
 * @access private
 */
const unreadMessages = asyncHandler(async (req, res, next) => {
	//get all chats the user is part of
	const chatIds = (await Chat.find({ users: { $in: [req.user.id] } })).map(
		(chat) => chat.id
	);

	const unreadMessages = await Message.find({
		chat: { $in: chatIds },
		readBy: { $nin: [req.user.id] },
	});
	res
		.status(200)
		.json({ data: { total: unreadMessages.length, unreadMessages } });
});

module.exports = {
	newChat,
	sendMessage,
	getChat,
	addUsers,
	getInbox,
	getLastMessage,
	deleteMessage,
	leaveChat,
	updateChatTitle,
	unreadMessages,
};
