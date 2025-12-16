const itemRepository = require('../repositories/itemRepository');

class ItemService {
  async getAllItems() {
    return await itemRepository.findAll();
  }

  async getItemsByCategory(categoryId) {
    return await itemRepository.findByCategory(categoryId);
  }

  async getItemById(id) {
    const item = await itemRepository.findById(id);
    if (!item) {
      throw new Error('Item not found');
    }
    return item;
  }

  async createItem(data) {
    return await itemRepository.create(data);
  }

  async updateItem(id, data) {
    const item = await itemRepository.findById(id);
    if (!item) {
      throw new Error('Item not found');
    }
    return await itemRepository.update(id, data);
  }

  async deleteItem(id) {
    const item = await itemRepository.findById(id);
    if (!item) {
      throw new Error('Item not found');
    }
    return await itemRepository.delete(id);
  }
}

module.exports = new ItemService();