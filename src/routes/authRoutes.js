const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { registerValidation } = require('../validations/registerUserValidation');
const { loginValidation } = require('../validations/loginUserValidation');
const { forgotPasswordValidation } = require('../validations/forgotPasswordValidation');
const { verifyOTPValidation } = require('../validations/verifyOTPValidation');
const { resetPasswordValidation } = require('../validations/resetPasswordValidation');
const { socialLoginValidation } = require('../validations/socialLoginValidation');
const { updatePasswordValidation } = require('../validations/updatePasswordValidation');
const { resendOTPValidation } = require('../validations/resendOTPValidation');

const router = express.Router();

router.post('/signup', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/social-login', socialLoginValidation, authController.socialLogin);
router.post('/logout', authMiddleware, authController.logout);
router.post('/forgot-password', forgotPasswordValidation, authController.forgotPassword);
router.post('/verify-otp', verifyOTPValidation, authController.verifyOTP);
router.post('/reset-password', resetPasswordValidation, authController.resetPassword);
router.post('/resend-otp', resendOTPValidation, authController.resendOTP);
router.put('/update-password', authMiddleware, updatePasswordValidation, authController.updatePassword);

module.exports = router;
