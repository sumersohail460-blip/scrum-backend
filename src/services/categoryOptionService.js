const categoryOptionRepository = require('../repositories/categoryOptionRepository');

class CategoryOptionService {
  async getAllCategoryOptions() {
    return await categoryOptionRepository.findAll();
  }

  async getCategoryOptionsByCategory(categoryId) {
    return await categoryOptionRepository.findByCategoryId(categoryId);
  }

  async getCategoryOptionById(id) {
    const categoryOption = await categoryOptionRepository.findById(id);
    if (!categoryOption) {
      throw new Error('Category option not found');
    }
    return categoryOption;
  }

  async createCategoryOption(data) {
    return await categoryOptionRepository.create(data);
  }

  async updateCategoryOption(id, data) {
    const categoryOption = await categoryOptionRepository.findById(id);
    if (!categoryOption) {
      throw new Error('Category option not found');
    }
    return await categoryOptionRepository.update(id, data);
  }

  async deleteCategoryOption(id) {
    const categoryOption = await categoryOptionRepository.findById(id);
    if (!categoryOption) {
      throw new Error('Category option not found');
    }
    return await categoryOptionRepository.delete(id);
  }
}

module.exports = new CategoryOptionService();