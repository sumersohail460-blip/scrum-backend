const prisma = require('../config/dbConfig');

class ItemRepository {
  async findAll() {
    return await prisma.item.findMany({
      include: { category: true },
      orderBy: { name: 'asc' }
    });
  }

  async findByCategory(categoryId) {
    return await prisma.item.findMany({
      where: { categoryId },
      include: { category: true },
      orderBy: { name: 'asc' }
    });
  }

  async findById(id) {
    return await prisma.item.findUnique({
      where: { id },
      include: { category: true }
    });
  }

  async create(data) {
    return await prisma.item.create({
      data,
      include: { category: true }
    });
  }

  async update(id, data) {
    return await prisma.item.update({
      where: { id },
      data,
      include: { category: true }
    });
  }

  async delete(id) {
    return await prisma.item.delete({ where: { id } });
  }
}

module.exports = new ItemRepository();