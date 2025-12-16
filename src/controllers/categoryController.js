const categoryService = require('../services/categoryService');
const { successResponse, errorResponse } = require('../utils/apiResponseUtil');

class CategoryController {
  async getCategories(req, res) {
    try {
      const categories = await categoryService.getAllCategories();
      return successResponse(res, categories, 'Categories retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getCategory(req, res) {
    try {
      const { id } = req.params;
      const category = await categoryService.getCategoryById(id);
      return successResponse(res, category, 'Category retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  async createCategory(req, res) {
    try {
      const category = await categoryService.createCategory(req.body);
      return successResponse(res, category, 'Category created successfully', 201);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const category = await categoryService.updateCategory(id, req.body);
      return successResponse(res, category, 'Category updated successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      await categoryService.deleteCategory(id);
      return successResponse(res, null, 'Category deleted successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

module.exports = new CategoryController();