const addOnService = require('../services/addOnService');
const { successResponse, errorResponse } = require('../utils/apiResponseUtil');

class AddOnController {
  async getAddOns(req, res) {
    try {
      const { active } = req.query;
      
      let addOns;
      if (active === 'true') {
        addOns = await addOnService.getActiveAddOns();
      } else {
        addOns = await addOnService.getAllAddOns();
      }
      
      return successResponse(res, addOns, 'Add-ons retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getAddOn(req, res) {
    try {
      const { id } = req.params;
      const addOn = await addOnService.getAddOnById(id);
      return successResponse(res, addOn, 'Add-on retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  async createAddOn(req, res) {
    try {
      const addOn = await addOnService.createAddOn(req.body);
      return successResponse(res, addOn, 'Add-on created successfully', 201);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async updateAddOn(req, res) {
    try {
      const { id } = req.params;
      const addOn = await addOnService.updateAddOn(id, req.body);
      return successResponse(res, addOn, 'Add-on updated successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async deleteAddOn(req, res) {
    try {
      const { id } = req.params;
      await addOnService.deleteAddOn(id);
      return successResponse(res, null, 'Add-on deleted successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

module.exports = new AddOnController();