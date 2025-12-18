const prisma = require('../config/dbConfig');

class CartRepository {
  async findUserCart(userId) {
    return await prisma.cart.findFirst({
      where: { userId },
      include: {
        cartItems: {
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
          }
        }
      }
    });
  }

  async createCart(userId) {
    return await prisma.cart.create({
      data: { userId }
    });
  }

  async addItemToCart(cartId, itemId, quantity) {
    return await prisma.cartItem.upsert({
      where: {
        cartId_itemId: {
          cartId,
          itemId
        }
      },
      update: {
        quantity: {
          increment: quantity
        }
      },
      create: {
        cartId,
        itemId,
        quantity
      },
      include: {
        item: true
      }
    });
  }

  async updateCartItemQuantity(cartId, itemId, quantity) {
    return await prisma.cartItem.update({
      where: {
        cartId_itemId: {
          cartId,
          itemId
        }
      },
      data: { quantity },
      include: {
        item: true
      }
    });
  }

  async removeItemFromCart(cartId, itemId) {
    return await prisma.cartItem.delete({
      where: {
        cartId_itemId: {
          cartId,
          itemId
        }
      }
    });
  }

  async clearCart(cartId) {
    return await prisma.cartItem.deleteMany({
      where: { cartId }
    });
  }
}

module.exports = new CartRepository();