const express = require('express');
const authController = require('../controllers/authController');
const { registerValidation } = require('../validations/registerUserValidation');
const { loginValidation } = require('../validations/loginUserValidation');
const { forgotPasswordValidation } = require('../validations/forgotPasswordValidation');
const { verifyOTPValidation } = require('../validations/verifyOTPValidation');
const { resetPasswordValidation } = require('../validations/resetPasswordValidation');

const router = express.Router();

router.post('/signup', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/forgot-password', forgotPasswordValidation, authController.forgotPassword);
router.post('/verify-otp', verifyOTPValidation, authController.verifyOTP);
router.post('/reset-password', resetPasswordValidation, authController.resetPassword);

module.exports = router;