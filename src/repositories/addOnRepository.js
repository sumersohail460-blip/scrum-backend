const prisma = require('../config/dbConfig');

class AddOnRepository {
  async findAll() {
    return await prisma.addOn.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async findActive() {
    return await prisma.addOn.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
  }

  async findById(id) {
    return await prisma.addOn.findUnique({
      where: { id }
    });
  }

  async create(data) {
    return await prisma.addOn.create({ data });
  }

  async update(id, data) {
    return await prisma.addOn.update({
      where: { id },
      data
    });
  }

  async delete(id) {
    return await prisma.addOn.delete({ where: { id } });
  }
}

module.exports = new AddOnRepository();