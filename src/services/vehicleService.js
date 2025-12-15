const vehicleRepository = require('../repositories/vehicleRepository');
const userRepository = require('../repositories/userRepository');

class VehicleService {
  async createVehicle(userId, vehicleData) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const existingVehicle = await vehicleRepository.findByPlateNo(vehicleData.plateNo);
    if (existingVehicle) {
      throw new Error('Vehicle with this plate number already exists');
    }

    return await vehicleRepository.create({ ...vehicleData, userId });
  }

  async getVehicleById(id) {
    const vehicle = await vehicleRepository.findById(id);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    return vehicle;
  }

  async getUserVehicles(userId) {
    return await vehicleRepository.findByUserId(userId);
  }

  async updateVehicle(id, updateData) {
    const vehicle = await vehicleRepository.findById(id);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    if (updateData.plateNo && updateData.plateNo !== vehicle.plateNo) {
      const existingVehicle = await vehicleRepository.findByPlateNo(updateData.plateNo);
      if (existingVehicle) {
        throw new Error('Vehicle with this plate number already exists');
      }
    }

    return await vehicleRepository.update(id, updateData);
  }

  async deleteVehicle(id) {
    const vehicle = await vehicleRepository.findById(id);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    return await vehicleRepository.delete(id);
  }

  async getAllVehicles() {
    return await vehicleRepository.findAll();
  }
}

module.exports = new VehicleService();