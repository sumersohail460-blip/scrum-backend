const prisma = require('../config/dbConfig');

class VehicleRepository {
  async create(vehicleData) {
    return await prisma.vehicle.create({ data: vehicleData });
  }

  async findById(id) {
    const result = await prisma.vehicle.findUnique({ 
      where: { id },
      include: { user: true }
    });
    if (result?.user) {
      delete result.user.password;
    }
    return result;
  }

  async findByUserId(userId) {
    const results = await prisma.vehicle.findMany({ 
      where: { userId },
      include: { user: true }
    });
    results.forEach(result => {
      if (result?.user) {
        delete result.user.password;
      }
    });
    return results;
  }

  async findByPlateNo(plateNo) {
    const result = await prisma.vehicle.findUnique({ 
      where: { plateNo },
      include: { user: true }
    });
    if (result?.user) {
      delete result.user.password;
    }
    return result;
  }

  async update(id, updateData) {
    const result = await prisma.vehicle.update({
      where: { id },
      data: updateData,
      include: { user: true }
    });
    if (result?.user) {
      delete result.user.password;
    }
    return result;
  }

  async delete(id) {
    return await prisma.vehicle.delete({ where: { id } });
  }

  async findAll() {
    const results = await prisma.vehicle.findMany({
      include: { user: true }
    });
    results.forEach(result => {
      if (result?.user) {
        delete result.user.password;
      }
    });
    return results;
  }
}

module.exports = new VehicleRepository();