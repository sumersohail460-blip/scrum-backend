const userService = require('../services/userService');
const { successResponse, exceptionResponse } = require('../utils/apiResponseUtil');

class UserController {
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const updateData = req.body;
      const imageFile = req.file;

      const result = await userService.updateProfile(userId, updateData, imageFile);
      return successResponse(res, result, result.message);
    } catch (error) {
      return exceptionResponse(res, error);
    }
  }

  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const result = await userService.getProfile(userId);
      return successResponse(res, result, 'Profile retrieved successfully');
    } catch (error) {
      return exceptionResponse(res, error);
    }
  }

  async deleteUser(req, res) {
    try {
      const userId = req.params.id;
      const result = await userService.deleteUser(userId);
      return successResponse(res, result, result.message);
    } catch (error) {
      return exceptionResponse(res, error);
    }
  }

  async getAllUsers(req, res) {
    try {
      const result = await userService.getAllUsers();
      return successResponse(res, result, 'Users retrieved successfully');
    } catch (error) {
      return exceptionResponse(res, error);
    }
  }

  async getSettings(req, res) {
    try {
      const userId = req.user.id;
      const result = await userService.getSettings(userId);
      return successResponse(res, result, 'Settings retrieved successfully');
    } catch (error) {
      return exceptionResponse(res, error);
    }
  }

  async updateSettings(req, res) {
    try {
      const userId = req.user.id;
      const result = await userService.updateSettings(userId, req.body);
      return successResponse(res, result, result.message);
    } catch (error) {
      return exceptionResponse(res, error);
    }
  }
}

module.exports = new UserController();