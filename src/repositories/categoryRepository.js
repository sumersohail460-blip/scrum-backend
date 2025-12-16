const prisma = require('../config/dbConfig');

class CategoryRepository {
  async findAll() {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async findById(id) {
    return await prisma.category.findUnique({
      where: { id }
    });
  }

  async create(data) {
    return await prisma.category.create({ data });
  }

  async update(id, data) {
    return await prisma.category.update({
      where: { id },
      data
    });
  }

  async delete(id) {
    return await prisma.category.delete({ where: { id } });
  }
}

module.exports = new CategoryRepository();