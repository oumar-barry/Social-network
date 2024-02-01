const multer = require('multer');
const path = require('path');

exports.storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, '../uploads/');
	},
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname);
		file.filename = Date.now() + '_' + ext;
		cb(null, file.filename);
	},
});

exports.fileFilter = function (req, file, cb) {
	if (file.size > process.env.MAX_PROFILE_PICTURE_SIZE) {
		return cb(new Error('Maximum image size must be 10 MB'));
	}

	if (!file.mimetype.startsWith('image/')) {
		return cb(new Error('Please choose an image to upload '));
	}

	cb(null, true);
};
