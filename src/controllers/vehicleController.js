const vehicleService = require('../services/vehicleService');
const { successResponse, errorResponse } = require('../utils/apiResponseUtil');

class VehicleController {
  async createVehicle(req, res) {
    try {
      const userId = req.user.userId || req.user.id;
      const { make, model, plateNo, color } = req.body;
      
      const missing = [];
      if (!make) missing.push('make');
      if (!model) missing.push('model');
      if (!plateNo) missing.push('plateNo');
      if (!color) missing.push('color');
      
      if (missing.length > 0) {
        return errorResponse(res, `${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} required`, 400);
      }
      
      const vehicle = await vehicleService.createVehicle(userId, { make, model, plateNo, color });
      return successResponse(res, vehicle, 'Vehicle created successfully', 201);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getVehicle(req, res) {
    try {
      const { id } = req.params;
      const vehicle = await vehicleService.getVehicleById(id);
      return successResponse(res, vehicle, 'Vehicle retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  async getUserVehicles(req, res) {
    try {
      const userId = req.user.userId || req.user.id;
      const vehicles = await vehicleService.getUserVehicles(userId);
      return successResponse(res, vehicles, 'User vehicles retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async updateVehicle(req, res) {
    try {
      const { id } = req.params;
      const { make, model, plateNo, color } = req.body;
      
      if (!make && !model && !plateNo && !color) {
        return errorResponse(res, 'At least one field (make, model, plateNo, color) is required', 400);
      }
      
      const updateData = {};
      if (make) updateData.make = make;
      if (model) updateData.model = model;
      if (plateNo) updateData.plateNo = plateNo;
      if (color) updateData.color = color;
      
      const vehicle = await vehicleService.updateVehicle(id, updateData);
      return successResponse(res, vehicle, 'Vehicle updated successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async deleteVehicle(req, res) {
    try {
      const { id } = req.params;
      await vehicleService.deleteVehicle(id);
      return successResponse(res, {}, 'Vehicle deleted successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getAllVehicles(req, res) {
    try {
      const vehicles = await vehicleService.getAllVehicles();
      return successResponse(res, vehicles, 'All vehicles retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

module.exports = new VehicleController();