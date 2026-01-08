const categoryOptionService = require('../services/categoryOptionService');
const { successResponse, errorResponse } = require('../utils/apiResponseUtil');

class CategoryOptionController {
  async getCategoryOptions(req, res) {
    try {
      const { categoryId } = req.query;
      
      let categoryOptions;
      if (categoryId) {
        categoryOptions = await categoryOptionService.getCategoryOptionsByCategory(categoryId);
      } else {
        categoryOptions = await categoryOptionService.getAllCategoryOptions();
      }
      
      return successResponse(res, categoryOptions, 'Category options retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getCategoryOption(req, res) {
    try {
      const { id } = req.params;
      const categoryOption = await categoryOptionService.getCategoryOptionById(id);
      return successResponse(res, categoryOption, 'Category option retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  async createCategoryOption(req, res) {
    try {
      const categoryOption = await categoryOptionService.createCategoryOption(req.body);
      return successResponse(res, categoryOption, 'Category option created successfully', 201);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async updateCategoryOption(req, res) {
    try {
      const { id } = req.params;
      const categoryOption = await categoryOptionService.updateCategoryOption(id, req.body);
      return successResponse(res, categoryOption, 'Category option updated successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async deleteCategoryOption(req, res) {
    try {
      const { id } = req.params;
      await categoryOptionService.deleteCategoryOption(id);
      return successResponse(res, null, 'Category option deleted successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

module.exports = new CategoryOptionController();