const prisma = require('../config/dbConfig');

class CategoryOptionRepository {
  async findAll() {
    return await prisma.categoryOption.findMany({
      include: { category: true },
      orderBy: { optionType: 'asc' }
    });
  }

  async findByCategoryId(categoryId) {
    return await prisma.categoryOption.findMany({
      where: { categoryId },
      include: { category: true },
      orderBy: { optionType: 'asc' }
    });
  }

  async findById(id) {
    return await prisma.categoryOption.findUnique({
      where: { id },
      include: { category: true }
    });
  }

  async create(data) {
    return await prisma.categoryOption.create({
      data,
      include: { category: true }
    });
  }

  async update(id, data) {
    return await prisma.categoryOption.update({
      where: { id },
      data,
      include: { category: true }
    });
  }

  async delete(id) {
    return await prisma.categoryOption.delete({ where: { id } });
  }
}

module.exports = new CategoryOptionRepository();