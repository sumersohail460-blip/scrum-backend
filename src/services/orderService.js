const orderRepository = require('../repositories/orderRepository');
const cartRepository = require('../repositories/cartRepository');
const userRepository = require('../repositories/userRepository');

class OrderService {
  async getOrderDetails(userId) {
    const orderDetails = await this.getFullOrderDetails(userId);
    
    return {
      subtotal: orderDetails.subtotal,
      platformFee: orderDetails.platformFee,
      gst: orderDetails.gst,
      totalAmount: orderDetails.totalAmount
    };
  }

  async getFullOrderDetails(userId) {
    const cart = await cartRepository.findUserCart(userId);
    if (!cart || cart.cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    const cartItems = cart.cartItems.map(cartItem => {
      let itemTotal = parseFloat(cartItem.item.currentPrice) * cartItem.quantity;
      
      // Add option prices
      cartItem.cartItemOptions.forEach(option => {
        itemTotal += parseFloat(option.categoryOption.extraPrice) * cartItem.quantity;
      });
      
      // Add add-on prices
      cartItem.cartItemAddOns.forEach(addOn => {
        itemTotal += parseFloat(addOn.addOn.price) * cartItem.quantity;
      });

      return {
        id: cartItem.id,
        item: {
          id: cartItem.item.id,
          name: cartItem.item.name,
          price: parseFloat(cartItem.item.currentPrice)
        },
        quantity: cartItem.quantity,
        selectedOptions: cartItem.cartItemOptions.map(option => ({
          optionType: option.categoryOption.optionType,
          name: option.categoryOption.name,
          extraPrice: parseFloat(option.categoryOption.extraPrice)
        })),
        selectedAddOns: cartItem.cartItemAddOns.map(addOn => ({
          id: addOn.addOn.id,
          name: addOn.addOn.name,
          price: parseFloat(addOn.addOn.price)
        })),
        itemTotal: parseFloat(itemTotal.toFixed(2))
      };
    });

    const subtotal = cartItems.reduce((sum, item) => sum + item.itemTotal, 0);
    const platformFee = parseFloat((subtotal * 0.02).toFixed(2));
    const gst = parseFloat((subtotal * 0.17).toFixed(2));
    const totalAmount = parseFloat((subtotal + platformFee + gst).toFixed(2));

    return {
      cartItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      platformFee,
      gst,
      totalAmount
    };
  }

  async createOrder(userId, orderData) {
    const { serviceType, pickupType, scheduledTime, contact, paymentMethod, vehicleId, cardDetails } = orderData;

    // Validate service type
    if (!['PICKUP', 'DRIVE_THROUGH'].includes(serviceType)) {
      throw new Error('Invalid service type');
    }

    // Validate pickup type for both pickup and drive-through orders
    if ((serviceType === 'PICKUP' || serviceType === 'DRIVE_THROUGH') && pickupType && !['STANDARD', 'SCHEDULED'].includes(pickupType)) {
      throw new Error('Invalid pickup type');
    }

    // Validate vehicle for drive-through orders
    if (serviceType === 'DRIVE_THROUGH') {
      if (!vehicleId) {
        throw new Error('Vehicle ID is required for drive-through orders');
      }
      
      // Validate vehicle belongs to user
      const vehicleRepository = require('../repositories/vehicleRepository');
      const vehicle = await vehicleRepository.findById(vehicleId);
      if (!vehicle || vehicle.userId !== userId) {
        throw new Error('Invalid vehicle or vehicle does not belong to user');
      }
    }

    // Validate payment method
    const validPaymentMethods = ['CASH', 'CARD', 'APPLE_PAY'];
    const finalPaymentMethod = paymentMethod && validPaymentMethods.includes(paymentMethod) ? paymentMethod : 'CASH';

    // Validate card details if payment method is CARD
    let cardInfo = null;
    if (finalPaymentMethod === 'CARD') {
      if (!cardDetails || !cardDetails.cardNumber || !cardDetails.cardExpiry || !cardDetails.cardCvc || !cardDetails.cardHolder) {
        throw new Error('Card details are required for card payment');
      }
      
      // Basic card validation
      if (!/^[0-9]{13,19}$/.test(cardDetails.cardNumber.replace(/\s/g, ''))) {
        throw new Error('Invalid card number');
      }
      
      if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(cardDetails.cardExpiry)) {
        throw new Error('Invalid card expiry format (MM/YY)');
      }
      
      if (!/^[0-9]{3,4}$/.test(cardDetails.cardCvc)) {
        throw new Error('Invalid CVC');
      }
      
      if (!cardDetails.cardHolder.trim()) {
        throw new Error('Card holder name is required');
      }
      
      cardInfo = {
        cardNumber: cardDetails.cardNumber.replace(/\s/g, ''),
        cardExpiry: cardDetails.cardExpiry,
        cardCvc: cardDetails.cardCvc,
        cardHolder: cardDetails.cardHolder.trim()
      };
    }

    // Handle scheduled time based on pickup type
    let finalScheduledTime = null;
    if (pickupType === 'SCHEDULED') {
      if (!scheduledTime) {
        throw new Error('Scheduled time is required for scheduled pickup');
      }
      
      const scheduledDate = new Date(scheduledTime);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      scheduledDate.setHours(0, 0, 0, 0);
      
      if (scheduledDate.getTime() !== today.getTime()) {
        throw new Error('Scheduled pickup must be for today only');
      }
      
      finalScheduledTime = new Date(scheduledTime);
    } else if (pickupType === 'STANDARD' || (serviceType === 'DRIVE_THROUGH' && !pickupType)) {
      // For standard pickup/drive-through, set time to current time + 20 minutes
      const now = new Date();
      finalScheduledTime = new Date(now.getTime() + 20 * 60 * 1000);
    }

    // Validate contact phone if provided
    let contactPhone = null;
    if (contact) {
      const phoneRegex = /^[+]?[1-9]?[0-9]{7,15}$/;
      if (!phoneRegex.test(contact)) {
        throw new Error('Invalid phone number format');
      }
      contactPhone = contact;
      
      // Update user's phone if provided
      await this.updateUserPhone(userId, contact);
    }

    // Get order details from cart
    const orderDetails = await this.getFullOrderDetails(userId);
    
    // Create order
    const order = await orderRepository.createOrder({
      userId,
      serviceType,
      pickupType,
      scheduledTime: finalScheduledTime,
      contactPhone,
      vehicleId: serviceType === 'DRIVE_THROUGH' ? vehicleId : null,
      paymentMethod: finalPaymentMethod,
      cardInfo,
      subtotal: orderDetails.subtotal,
      platformFee: orderDetails.platformFee,
      gst: orderDetails.gst,
      totalAmount: orderDetails.totalAmount,
      cartItems: orderDetails.cartItems
    });

    // Add items to loyalty card
    const totalLoyaltyItems = await this.addItemsToLoyaltyCard(userId, order.id, orderDetails.cartItems);

    // Clear cart after successful order creation
    const cart = await cartRepository.findUserCart(userId);
    if (cart) {
      await cartRepository.clearCart(cart.id);
    }

    return {
      message: 'Order created successfully',
      order,
      loyaltyCardItems: totalLoyaltyItems
    };
  }

  async addItemsToLoyaltyCard(userId, orderId, cartItems) {
    const loyaltyCardRepository = require('../repositories/loyaltyCardRepository');
    const prisma = require('../config/dbConfig');
    
    // Get or create loyalty card
    let loyaltyCard = await loyaltyCardRepository.findByUserId(userId);
    if (!loyaltyCard) {
      const loyaltyCardService = require('./loyaltyCardService');
      loyaltyCard = await loyaltyCardService.createLoyaltyCard(userId);
    }

    // Calculate total items
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // Update loyalty card
    await prisma.loyaltyCard.update({
      where: { id: loyaltyCard.id },
      data: { 
        points: { increment: totalItems },
        totalItems: { increment: totalItems }
      }
    });

    return totalItems;
  }

  async getUserOrders(userId, status = null) {
    return await orderRepository.findUserOrders(userId, status);
  }

  async getOrderById(orderId, userId) {
    const order = await orderRepository.findOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    
    if (order.userId !== userId) {
      throw new Error('Unauthorized access to order');
    }
    
    return order;
  }

  async deleteOrder(orderId, userId) {
    const order = await orderRepository.findOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    
    if (order.userId !== userId) {
      throw new Error('Unauthorized access to order');
    }
    
    // Only allow deletion of pending orders
    if (order.status !== 'PENDING') {
      throw new Error('Only pending orders can be deleted');
    }
    
    await orderRepository.deleteOrder(orderId);
    
    return {
      message: 'Order deleted successfully'
    };
  }

  async updateUserPhone(userId, phone) {
    await userRepository.updateUser(userId, { phone });
  }

  async completeOrder(orderId, userId) {
    const order = await orderRepository.findOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    
    if (order.userId !== userId) {
      throw new Error('Unauthorized access to order');
    }
    
    if (order.status === 'COMPLETED') {
      throw new Error('Order is already completed');
    }
    
    await orderRepository.updateOrderStatus(orderId, 'COMPLETED');
    
    // Trigger auto-favourite checks
    const autoFavouriteService = require('./autoFavouriteService');
    for (const orderItem of order.orderItems) {
      await autoFavouriteService.checkAndAddToFavourites(userId, orderItem.itemId);
    }
    
    return {
      message: 'Order completed successfully'
    };
  }
}

module.exports = new OrderService();