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
      const { withOptions } = req.query;
      
      let result;
      if (withOptions === 'true') {
        result = await itemService.getItemWithOptions(id);
      } else {
        result = await itemService.getItemById(id);
      }
      
      return successResponse(res, result, 'Item retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  async createItem(req, res) {
    try {
      const itemData = { ...req.body };
      
      // Convert string fields to proper types
      if (itemData.currentPrice) itemData.currentPrice = parseInt(itemData.currentPrice);
      if (itemData.previousPrice) itemData.previousPrice = parseInt(itemData.previousPrice);
      if (itemData.rating) itemData.rating = parseFloat(itemData.rating);
      if (itemData.stock) itemData.stock = parseInt(itemData.stock);
      
      if (req.file) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        itemData.imageUrl = `${baseUrl}/uploads/items/${req.file.filename}`;
      }
      const item = await itemService.createItem(itemData);
      return successResponse(res, item, 'Item created successfully', 201);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async updateItem(req, res) {
    try {
      const { id } = req.params;
      const itemData = { ...req.body };
      
      // Convert string fields to proper types
      if (itemData.currentPrice) itemData.currentPrice = parseInt(itemData.currentPrice);
      if (itemData.previousPrice) itemData.previousPrice = parseInt(itemData.previousPrice);
      if (itemData.rating) itemData.rating = parseFloat(itemData.rating);
      if (itemData.stock) itemData.stock = parseInt(itemData.stock);
      
      if (req.file) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        itemData.imageUrl = `${baseUrl}/uploads/items/${req.file.filename}`;
      }
      const item = await itemService.updateItem(id, itemData);
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