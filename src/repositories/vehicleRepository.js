const prisma = require('../config/dbConfig');

class VehicleRepository {
  async create(vehicleData) {
    return await prisma.vehicle.create({ data: vehicleData });
  }

  async findById(id) {
    return await prisma.vehicle.findUnique({ 
      where: { id },
      include: { user: true }
    });
  }

  async findByUserId(userId) {
    return await prisma.vehicle.findMany({ 
      where: { userId },
      include: { user: true }
    });
  }

  async findByPlateNo(plateNo) {
    return await prisma.vehicle.findUnique({ 
      where: { plateNo },
      include: { user: true }
    });
  }

  async update(id, updateData) {
    return await prisma.vehicle.update({
      where: { id },
      data: updateData,
      include: { user: true }
    });
  }

  async delete(id) {
    return await prisma.vehicle.delete({ where: { id } });
  }

  async findAll() {
    return await prisma.vehicle.findMany({
      include: { user: true }
    });
  }
}

module.exports = new VehicleRepository();