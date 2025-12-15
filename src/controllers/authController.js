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
      
      if (result.error) {
        return errorResponse(res, result.error, result.statusCode);
      }
      
      return successResponse(res, result, 'Login successful');
    } catch (error) {
      return exceptionResponse(res, error);
    }
  }

  async forgotPassword(req, res) {
    try {
      const result = await authService.forgotPassword(req.body);
      return successResponse(res, result, result.message);
    } catch (error) {
      return exceptionResponse(res, error);
    }
  }

  async verifyOTP(req, res) {
    try {
      const { contact, email, otp, type = 'EMAIL_VERIFICATION' } = req.body;
      // Support both 'contact' and 'email' for backward compatibility
      const contactToVerify = contact || email;
      const result = await authService.verifyOTP(contactToVerify, otp, type);
      return successResponse(res, result, result.message);
    } catch (error) {
      return exceptionResponse(res, error);
    }
  }

  async resetPassword(req, res) {
    try {
      const { contact, email, password, contactType } = req.body;
      const contactData = {
        contact: contact || email,
        contactType
      };
      const result = await authService.resetPassword(contactData, password);
      return successResponse(res, result, result.message);
    } catch (error) {
      return exceptionResponse(res, error);
    }
  }

  async socialLogin(req, res) {
    try {
      const result = await authService.socialLogin(req.body);
      return successResponse(res, result, 'Social login successful');
    } catch (error) {
      return exceptionResponse(res, error);
    }
  }

  async updatePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;
      const result = await authService.updatePassword(userId, currentPassword, newPassword);
      return successResponse(res, result, result.message);
    } catch (error) {
      return exceptionResponse(res, error);
    }
  }

  async logout(req, res) {
    try {
      const userId = req.user.id;
      const accessToken = req.token;
      const result = await authService.logout(userId, accessToken);
      return successResponse(res, result, result.message);
    } catch (error) {
      return exceptionResponse(res, error);
    }
  }

  async resendOTP(req, res) {
    try {
      const result = await authService.resendOTP(req.body);
      return successResponse(res, result, result.message);
    } catch (error) {
      return exceptionResponse(res, error);
    }
  }
}

module.exports = new AuthController();