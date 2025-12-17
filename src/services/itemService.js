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

  async getItemWithOptions(id) {
    const categoryOptionRepository = require('../repositories/categoryOptionRepository');
    const addOnRepository = require('../repositories/addOnRepository');
    
    const item = await itemRepository.findById(id);
    if (!item) {
      throw new Error('Item not found');
    }
    
    const categoryOptions = await categoryOptionRepository.findByCategoryId(item.categoryId);
    const addOns = await addOnRepository.findActive();
    
    // Group category options by type for better frontend mapping
    const groupedOptions = categoryOptions.reduce((acc, option) => {
      if (!acc[option.optionType]) {
        acc[option.optionType] = [];
      }
      acc[option.optionType].push(option);
      return acc;
    }, {});
    
    return {
      item,
      categoryOptions: groupedOptions,
      addOns
    };
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