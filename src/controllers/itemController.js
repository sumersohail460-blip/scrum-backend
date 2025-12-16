const itemService = require('../services/itemService');
const { successResponse, errorResponse } = require('../utils/apiResponseUtil');

class ItemController {
  async getItems(req, res) {
    try {
      const { categoryId } = req.query;
      
      let items;
      if (categoryId) {
        items = await itemService.getItemsByCategory(categoryId);
      } else {
        items = await itemService.getAllItems();
      }
      
      return successResponse(res, items, 'Items retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getItem(req, res) {
    try {
      const { id } = req.params;
      const item = await itemService.getItemById(id);
      return successResponse(res, item, 'Item retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  async createItem(req, res) {
    try {
      const item = await itemService.createItem(req.body);
      return successResponse(res, item, 'Item created successfully', 201);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async updateItem(req, res) {
    try {
      const { id } = req.params;
      const item = await itemService.updateItem(id, req.body);
      return successResponse(res, item, 'Item updated successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async deleteItem(req, res) {
    try {
      const { id } = req.params;
      await itemService.deleteItem(id);
      return successResponse(res, null, 'Item deleted successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

module.exports = new ItemController();