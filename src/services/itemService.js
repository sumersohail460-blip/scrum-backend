const itemRepository = require('../repositories/itemRepository');

class ItemService {
  async getAllItems(userId = null) {
    return await itemRepository.findAll(userId);
  }

  async getItemsByCategory(categoryId, userId = null) {
    return await itemRepository.findByCategory(categoryId, userId);
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
    const addOns = await addOnRepository.findByCategoryId(item.categoryId);
    
    // Group category options by type for better frontend mapping
    // const groupedOptions = categoryOptions.reduce((acc, option) => {
    //   if (!acc[option.optionType]) {
    //     acc[option.optionType] = [];
    //   }
    //   acc[option.optionType].push(option);
    //   return acc;
    // }, {});

    const groupedOptionsMap = categoryOptions.reduce((acc, option) => {
    if (!acc[option.optionType]) {
      acc[option.optionType] = {
        optionType: option.optionType,
        options: []
      };
    }
    acc[option.optionType].options.push(option);
    return acc;
    }, {});

    const groupedOptions = Object.values(groupedOptionsMap);
    
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