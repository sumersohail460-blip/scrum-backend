const prisma = require('../config/dbConfig');

class FavouriteRepository {
  async findByUserAndItem(userId, itemId) {
    return await prisma.favourite.findUnique({
      where: { userId_itemId: { userId, itemId } }
    });
  }

  async findByUserId(userId) {
    return await prisma.favourite.findMany({
      where: { userId },
      include: {
        item: {
          include: { 
            category: true,
            images: {
              where: { isPrimary: true },
              take: 1
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(userId, itemId) {
    return await prisma.favourite.create({
      data: { userId, itemId }
    });
  }

  async delete(userId, itemId) {
    return await prisma.favourite.delete({
      where: { userId_itemId: { userId, itemId } }
    });
  }

  async findUserFavourite(userId, itemId) {
    return await prisma.favourite.findUnique({
      where: { userId_itemId: { userId, itemId } }
    });
  }

  async addToFavourites(userId, itemId) {
    return await prisma.favourite.create({
      data: { userId, itemId }
    });
  }
}

module.exports = new FavouriteRepository();