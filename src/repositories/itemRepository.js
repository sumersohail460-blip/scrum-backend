const prisma = require('../config/dbConfig');

class ItemRepository {
  async findAll(userId = null) {
    const items = await prisma.item.findMany({
      include: { 
        category: true,
        images: {
          where: { isPrimary: true },
          take: 1
        },
        favourites: userId ? {
          where: { userId }
        } : false
      },
      orderBy: { name: 'asc' }
    });
    
    return items.map(item => ({
      ...item,
      isFavourite: userId ? item.favourites.length > 0 : false,
      favourites: undefined // Remove favourites array from response
    }));
  }

  async findByCategory(categoryId, userId = null) {
    const items = await prisma.item.findMany({
      where: { categoryId },
      include: { 
        category: true,
        images: {
          where: { isPrimary: true },
          take: 1
        },
        favourites: userId ? {
          where: { userId }
        } : false
      },
      orderBy: { name: 'asc' }
    });
    
    return items.map(item => ({
      ...item,
      isFavourite: userId ? item.favourites.length > 0 : false,
      favourites: undefined // Remove favourites array from response
    }));
  }

  async findById(id) {
    return await prisma.item.findUnique({
      where: { id },
      include: { 
        category: true,
        images: {
          orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }]
        }
      }
    });
  }

  async create(itemData) {
    const { images, ...data } = itemData;
    return await prisma.item.create({
      data: {
        ...data,
        images: images ? {
          create: images.map((img, index) => ({
            imageUrl: img.imageUrl,
            isPrimary: img.isPrimary || index === 0,
            order: index
          }))
        } : undefined
      },
      include: {
        category: true,
        images: {
          orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }]
        }
      }
    });
  }

  async update(id, updateData) {
    const { images, ...data } = updateData;
    
    if (images) {
      // Delete existing images and create new ones
      await prisma.itemImage.deleteMany({ where: { itemId: id } });
    }
    
    return await prisma.item.update({
      where: { id },
      data: {
        ...data,
        images: images ? {
          create: images.map((img, index) => ({
            imageUrl: img.imageUrl,
            isPrimary: img.isPrimary || index === 0,
            order: index
          }))
        } : undefined
      },
      include: { 
        category: true,
        images: {
          orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }]
        }
      }
    });
  }

  async delete(id) {
    return await prisma.item.delete({ where: { id } });
  }
}

module.exports = new ItemRepository();