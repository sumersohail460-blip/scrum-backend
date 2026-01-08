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
            },
            cartItemOptions: {
              include: {
                categoryOption: true
              }
            },
            cartItemAddOns: {
              include: {
                addOn: true
              }
            }
          }
        }
      }
    });
  }

  async createCart(userId) {
    return await prisma.cart.create({
      data: { userId },
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
            },
            cartItemOptions: {
              include: {
                categoryOption: true
              }
            },
            cartItemAddOns: {
              include: {
                addOn: true
              }
            }
          }
        }
      }
    });
  }

  async addItemToCart(cartId, itemId, quantity, selectedOptions = [], selectedAddOns = []) {
    const cartItem = await prisma.cartItem.create({
      data: {
        cartId,
        itemId,
        quantity,
        cartItemOptions: {
          create: selectedOptions.map(optionId => ({
            categoryOptionId: optionId
          }))
        },
        cartItemAddOns: {
          create: selectedAddOns.map(addOnId => ({
            addOnId: addOnId
          }))
        }
      },
      include: {
        item: true,
        cartItemOptions: {
          include: {
            categoryOption: true
          }
        },
        cartItemAddOns: {
          include: {
            addOn: true
          }
        }
      }
    });
    return cartItem;
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
        item: true,
        cartItemOptions: {
          include: {
            categoryOption: true
          }
        },
        cartItemAddOns: {
          include: {
            addOn: true
          }
        }
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

  async isItemInCart(userId, itemId) {
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        cartItems: {
          where: { itemId }
        }
      }
    });
    
    return cart && cart.cartItems.length > 0;
  }

  async getCartItemIdsForUser(userId) {
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        cartItems: {
          select: {
            itemId: true
          }
        }
      }
    });
    
    if (!cart) {
      return [];
    }
    
    return cart.cartItems.map(cartItem => cartItem.itemId);
  }
}

module.exports = new CartRepository();