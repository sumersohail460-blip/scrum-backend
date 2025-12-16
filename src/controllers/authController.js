const authService = require('../services/authService');
const { successResponse, errorResponse, exceptionResponse } = require('../utils/apiResponseUtil');

class AuthController {
  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      const message = result.phone ? 
        'Registration successful. Please verify your phone.' : 
        'Registration successful. Please verify your email.';
      return successResponse(res, result, message, 201);
    } catch (error) {
      const statusCode = error.message.includes('already exists') ? 400 : 500;
      return exceptionResponse(res, error, statusCode);
    }
  }

  async login(req, res) {
    try {
      const result = await authService.loginUser(req.body);
      
      if (result.message) {
        return errorResponse(res, result.message, result.statusCode);
      }
      
      return successResponse(res, result, 'Login successful');
    } catch (error) {
      return exceptionResponse(res, error);
    }
  }

  async forgotPassword(req, res) {
    try {
      const result = await authService.forgotPassword(req.body);
      return successResponse(res, {}, result.message);
    } catch (error) {
      return exceptionResponse(res, error);
    }
  }

  async verifyOTP(req, res) {
    try {
      const { otp, contact } = req.body;
      const result = await authService.verifyOTP(otp, contact);
      return successResponse(res, result, 'Email verified successfully');
    } catch (error) {
      const statusCode = error.message.includes('Invalid or expired OTP') ? 400 : 500;
      return exceptionResponse(res, error, statusCode);
    }
  }

  async verifyForgetPasswordOTP(req, res) {
    try {
      const { otp, contact } = req.body;
      const result = await authService.verifyForgetPasswordOTP(otp, contact);
      return successResponse(res, result, 'OTP verified successfully. You can now reset your password.');
    } catch (error) {
      const statusCode = error.message.includes('Invalid or expired OTP') ? 400 : 500;
      return exceptionResponse(res, error, statusCode);
    }
  }

  async resetPassword(req, res) {
    try {
      const { contact, password } = req.body;
      const result = await authService.resetPassword(contact, password);
      return successResponse(res, {}, result.message);
    } catch (error) {
      return exceptionResponse(res, error);
    }
  }

  async socialLogin(req, res) {
    try {
      const result = await authService.socialLogin(req.body);
      return successResponse(res, result, 'Social login successful');
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return exceptionResponse(res, error, statusCode);
    }
  }

  async updatePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;
      const result = await authService.updatePassword(userId, currentPassword, newPassword);
      return successResponse(res, {}, result.message);
    } catch (error) {
      return exceptionResponse(res, error);
    }
  }

  async logout(req, res) {
    try {
      const userId = req.user.id;
      const accessToken = req.token;
      const result = await authService.logout(userId, accessToken);
      return successResponse(res, {}, result.message);
    } catch (error) {
      return exceptionResponse(res, error);
    }
  }

  async resendOTP(req, res) {
    try {
      const result = await authService.resendOTP(req.body);
      return successResponse(res, {}, result.message);
    } catch (error) {
      return exceptionResponse(res, error);
    }
  }
}

module.exports = new AuthController();