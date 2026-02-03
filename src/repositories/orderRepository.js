const prisma = require('../config/dbConfig');
const OrderNumberGenerator = require('../utils/orderNumberGenerator');

class OrderRepository {
  async createOrder(orderData) {
    const { userId, serviceType, pickupType, scheduledTime, contactPhone, vehicleId, paymentMethod, cardInfo, subtotal, platformFee, gst, totalAmount, cartItems } = orderData;
    
    // Generate order number: 4 letters + 4 numbers (e.g., ORDF1234)
    const letters = String.fromCharCode(79, 82, 68, 70); // "ORDF"
    const numbers = Math.floor(1000 + Math.random() * 9000); // 1000-9999
    const orderNumber = `${letters}${numbers}`;
    
    return await prisma.order.create({
      data: {
        orderNumber,
        userId,
        serviceType,
        pickupType,
        scheduledTime,
        contactPhone,
        vehicleId,
        paymentMethod,
        cardNumber: cardInfo?.cardNumber || null,
        cardExpiry: cardInfo?.cardExpiry || null,
        cardCvc: cardInfo?.cardCvc || null,
        cardHolder: cardInfo?.cardHolder || null,
        subtotal,
        platformFee,
        gst,
        totalAmount,
        orderItems: {
          create: cartItems.map(cartItem => ({
            itemId: cartItem.item.id,
            quantity: cartItem.quantity,
            basePrice: cartItem.item.price,
            orderItemOptions: {
              create: cartItem.selectedOptions.map(option => ({
                optionType: option.optionType,
                optionValue: option.name,
                extraPrice: option.extraPrice
              }))
            },
            orderItemAddOns: {
              create: cartItem.selectedAddOns.map(addOn => ({
                addOnId: addOn.id,
                quantity: 1,
                price: addOn.price
              }))
            }
          }))
        }
      },
      include: {
        orderItems: {
          include: {
            item: true,
            orderItemOptions: true,
            orderItemAddOns: {
              include: {
                addOn: true
              }
            }
          }
        },
        vehicle: true
      }
    });
  }

  async findUserOrders(userId, status = null) {
    // Update expired orders before fetching
    await this.updateExpiredOrders();
    
    const whereClause = { userId };
    if (status) {
      whereClause.status = status;
    }
    
    return await prisma.order.findMany({
      where: whereClause,
      include: {
        orderItems: {
          include: {
            item: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1
                }
              }
            },
            orderItemOptions: true,
            orderItemAddOns: {
              include: {
                addOn: true
              }
            }
          }
        },
        vehicle: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOrderById(orderId) {
    return await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            item: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1
                }
              }
            },
            orderItemOptions: true,
            orderItemAddOns: {
              include: {
                addOn: true
              }
            }
          }
        }
      }
    });
  }

  async deleteOrder(orderId) {
    return await prisma.order.delete({
      where: { id: orderId }
    });
  }

  async findExpiredOrders(currentTime) {
    return await prisma.order.findMany({
      where: {
        status: 'PENDING',
        scheduledTime: {
          lte: currentTime
        }
      }
    });
  }

  async updateOrdersStatus(orderIds, status) {
    return await prisma.order.updateMany({
      where: {
        id: {
          in: orderIds
        }
      },
      data: {
        status: status
      }
    });
  }

  async countUserItemOrders(userId, itemId) {
    const result = await prisma.orderItem.aggregate({
      where: {
        itemId: itemId,
        order: {
          userId: userId,
          status: 'COMPLETED'
        }
      },
      _sum: {
        quantity: true
      }
    });
    
    return result._sum.quantity || 0;
  }

  async updateOrderStatus(orderId, status) {
    return await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
  }

  async updateExpiredOrders() {
    try {
      const now = new Date();
      const expiredOrders = await this.findExpiredOrders(now);
      
      if (expiredOrders.length > 0) {
        await this.updateOrdersStatus(
          expiredOrders.map(order => order.id), 
          'COMPLETED'
        );
        
        // Check for auto-favourites for each completed order
        const autoFavouriteService = require('../services/autoFavouriteService');
        for (const order of expiredOrders) {
          const fullOrder = await this.findOrderById(order.id);
          if (fullOrder && fullOrder.orderItems) {
            for (const orderItem of fullOrder.orderItems) {
              await autoFavouriteService.checkAndAddToFavourites(
                fullOrder.userId, 
                orderItem.itemId
              );
            }
          }
        }
      }
    } catch (error) {
      console.error('Error updating expired orders:', error);
    }
  }
}

module.exports = new OrderRepository();