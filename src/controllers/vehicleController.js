const vehicleService = require('../services/vehicleService');
const { successResponse, errorResponse } = require('../utils/apiResponseUtil');

class VehicleController {
  async createVehicle(req, res) {
    try {
      const userId = req.user.userId || req.user.id;
      const vehicleData = req.body;
      
      const vehicle = await vehicleService.createVehicle(userId, vehicleData);
      return successResponse(res, 'Vehicle created successfully', vehicle, 201);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getVehicle(req, res) {
    try {
      const { id } = req.params;
      const vehicle = await vehicleService.getVehicleById(id);
      return successResponse(res, 'Vehicle retrieved successfully', vehicle);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  async getUserVehicles(req, res) {
    try {
      const userId = req.user.userId || req.user.id;
      const vehicles = await vehicleService.getUserVehicles(userId);
      return successResponse(res, 'User vehicles retrieved successfully', vehicles);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async updateVehicle(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const vehicle = await vehicleService.updateVehicle(id, updateData);
      return successResponse(res, 'Vehicle updated successfully', vehicle);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async deleteVehicle(req, res) {
    try {
      const { id } = req.params;
      await vehicleService.deleteVehicle(id);
      return successResponse(res, 'Vehicle deleted successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getAllVehicles(req, res) {
    try {
      const vehicles = await vehicleService.getAllVehicles();
      return successResponse(res, 'All vehicles retrieved successfully', vehicles);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

module.exports = new VehicleController();