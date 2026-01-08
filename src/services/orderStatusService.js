const orderRepository = require('../repositories/orderRepository');

class OrderStatusService {
  async updateExpiredOrders() {
    return await orderRepository.updateExpiredOrders();
  }
}

module.exports = new OrderStatusService();