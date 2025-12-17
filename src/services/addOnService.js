const addOnRepository = require('../repositories/addOnRepository');

class AddOnService {
  async getAllAddOns() {
    return await addOnRepository.findAll();
  }

  async getActiveAddOns() {
    return await addOnRepository.findActive();
  }

  async getAddOnById(id) {
    const addOn = await addOnRepository.findById(id);
    if (!addOn) {
      throw new Error('Add-on not found');
    }
    return addOn;
  }

  async createAddOn(data) {
    return await addOnRepository.create(data);
  }

  async updateAddOn(id, data) {
    const addOn = await addOnRepository.findById(id);
    if (!addOn) {
      throw new Error('Add-on not found');
    }
    return await addOnRepository.update(id, data);
  }

  async deleteAddOn(id) {
    const addOn = await addOnRepository.findById(id);
    if (!addOn) {
      throw new Error('Add-on not found');
    }
    return await addOnRepository.delete(id);
  }
}

module.exports = new AddOnService();