const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { uploadProfileImage } = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.get('/', userController.getAllUsers);
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, uploadProfileImage, userController.updateProfile);
router.get('/notification-settings', authMiddleware, userController.getSettings);
router.put('/notification-settings', authMiddleware, userController.updateSettings);
router.delete('/:id', userController.deleteUser);

module.exports = router;