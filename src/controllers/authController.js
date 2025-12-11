const authService = require('../services/authService');
const { successResponse, errorResponse, exceptionResponse } = require('../utils/apiResponseUtil');

class AuthController {
  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      return successResponse(res, result, 'Registration successful. Please verify your email.', 201);
    } catch (error) {
      return exceptionResponse(res, error);
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
      const result = await authService.forgotPassword(req.body.email);
      return successResponse(res, result, 'OTP sent to your email');
    } catch (error) {
      return exceptionResponse(res, error);
    }
  }

  async verifyOTP(req, res) {
    try {
      const { email, otp, type = 'EMAIL_VERIFICATION' } = req.body;
      const result = await authService.verifyOTP(email, otp, type);
      return successResponse(res, result, result.message);
    } catch (error) {
      return exceptionResponse(res, error);
    }
  }

  async resetPassword(req, res) {
    try {
      const result = await authService.resetPassword(
        req.body.email,
        req.body.password
      );
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
}

module.exports = new AuthController();