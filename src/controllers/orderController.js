const orderService = require('../services/orderService');
const { successResponse, errorResponse } = require('../utils/apiResponseUtil');

class OrderController {
  async getOrderDetails(req, res) {
    try {
      const userId = req.user.id;
      const orderDetails = await orderService.getOrderDetails(userId);
      return successResponse(res, orderDetails, 'Order details retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async createOrder(req, res) {
    try {
      const { serviceType, pickupType, scheduledTime, contact, paymentMethod, vehicleId, cardDetails } = req.body;
      const userId = req.user.id;

      if (!serviceType) {
        return errorResponse(res, 'Service type is required', 400);
      }

      const result = await orderService.createOrder(userId, {
        serviceType,
        pickupType,
        scheduledTime,
        contact,
        paymentMethod,
        vehicleId,
        cardDetails
      });
      return successResponse(res, result, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getUserOrders(req, res) {
    try {
      const userId = req.user.id;
      const { status } = req.query;
      const orders = await orderService.getUserOrders(userId, status);
      return successResponse(res, orders, 'Orders retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getOrderById(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;
      const order = await orderService.getOrderById(orderId, userId);
      return successResponse(res, order, 'Order retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async deleteOrder(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;
      const result = await orderService.deleteOrder(orderId, userId);
      return successResponse(res, result, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async completeOrder(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;
      const bodyData = req.body; // Body data bhi available hai
      const result = await orderService.completeOrder(orderId, userId, bodyData);
      return successResponse(res, result, 'Order completed successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

module.exports = new OrderController();