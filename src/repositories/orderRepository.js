const prisma = require('../config/dbConfig');

class OrderRepository {
  async createOrder(orderData) {
    const { userId, serviceType, pickupType, scheduledTime, contactPhone, vehicleId, paymentMethod, cardInfo, subtotal, platformFee, gst, totalAmount, cartItems } = orderData;
    
    return await prisma.order.create({
      data: {
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

  async findUserOrders(userId) {
    return await prisma.order.findMany({
      where: { userId },
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
}

module.exports = new OrderRepository();