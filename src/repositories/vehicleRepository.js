const prisma = require('../config/dbConfig');

class VehicleRepository {
  async create(vehicleData) {
    return await prisma.vehicle.create({ data: vehicleData });
  }

  async findById(id) {
    return await prisma.vehicle.findUnique({ 
      where: { id }
    });
  }

  async findByUserId(userId) {
    return await prisma.vehicle.findMany({ 
      where: { userId }
    });
  }

  async findByPlateNo(plateNo) {
    return await prisma.vehicle.findUnique({ 
      where: { plateNo }
    });
  }

  async update(id, updateData) {
    return await prisma.vehicle.update({
      where: { id },
      data: updateData
    });
  }

  async delete(id) {
    return await prisma.vehicle.delete({ where: { id } });
  }

  async findAll() {
    return await prisma.vehicle.findMany();
  }
}

module.exports = new VehicleRepository();