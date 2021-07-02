const express = require('express');

const { getAllUsers, updateMe, deleteMe } = require('../controllers/userController');
const { protect, signup, login, forgotPassword, resetPassword, updatePassword } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:resetPasswordToken', resetPassword);
router.patch('/update-password', protect, updatePassword);
router.patch('/update-me', protect, updateMe);
router.delete('/delete-me', protect, deleteMe);
router.route('/').get(protect, getAllUsers);

module.exports = router;