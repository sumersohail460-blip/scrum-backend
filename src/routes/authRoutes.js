const express = require('express');
const authController = require('../controllers/authController');
const { registerValidation } = require('../validations/registerUserValidation');
const { loginValidation } = require('../validations/loginUserValidation');
const { forgotPasswordValidation } = require('../validations/forgotPasswordValidation');
const { verifyOTPValidation } = require('../validations/verifyOTPValidation');
const { resetPasswordValidation } = require('../validations/resetPasswordValidation');
const { socialLoginValidation } = require('../validations/socialLoginValidation');

const router = express.Router();

router.post('/signup', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/social-login', socialLoginValidation, authController.socialLogin);
router.post('/forgot-password', forgotPasswordValidation, authController.forgotPassword);
router.post('/verify-otp', verifyOTPValidation, authController.verifyOTP);
router.post('/reset-password', resetPasswordValidation, authController.resetPassword);

module.exports = router;
