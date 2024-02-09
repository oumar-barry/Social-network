const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const multer = require('multer');
const { storage, fileFilter } = require('../utils/multerSetup.js');
const upload = multer({ dest: 'uploads/' });

const {
	register,
	login,
	follow,
	search,
	newsfeed,
	getMe,
	getProfile,
	getFollowing,
	getFollowers,
	uploadProfilePicture,
	uploadCoverPicture,
	closeAccount,
	updateProfile,
	logout,
} = require('../controllers/UserController');

router.post('/register', register);
router.post('/login', login);
router.put('/:userId/follow', protect, follow);
router.post('/search', protect, search);
router.get('/newsfeed', protect, newsfeed);
router.get('/me', protect, getMe);
router.get('/:userId/profile', protect, getProfile);
router.get('/:userId/following', protect, getFollowing);
router.get('/:userId/followers', protect, getFollowers);
router.post(
	'/upload/profile-picture',
	protect,
	upload.single('profile'),
	uploadProfilePicture
);

router.post(
	'/upload/cover-picture',
	protect,
	upload.single('cover'),
	uploadCoverPicture
);
router.put('/close-account', protect, closeAccount);
router.put('/update-profile', protect, updateProfile);
router.post('/logout', protect, logout);

module.exports = router;
