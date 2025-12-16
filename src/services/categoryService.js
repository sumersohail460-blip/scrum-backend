const categoryRepository = require('../repositories/categoryRepository');

class CategoryService {
  async getAllCategories() {
    return await categoryRepository.findAll();
  }

  async getCategoryById(id) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  async createCategory(data) {
    return await categoryRepository.create(data);
  }

  async updateCategory(id, data) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }
    return await categoryRepository.update(id, data);
  }

  async deleteCategory(id) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }
    return await categoryRepository.delete(id);
  }
}

module.exports = new CategoryService();