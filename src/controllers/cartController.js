const cartService = require('../services/cartService');
const { successResponse, errorResponse } = require('../utils/apiResponseUtil');

class CartController {
  async addToCart(req, res) {
    try {
      const { itemId, quantity } = req.body;
      const userId = req.user.id;

      if (!itemId) {
        return errorResponse(res, 'Item ID is required', 400);
      }

      const result = await cartService.addToCart(userId, itemId, quantity || 1);
      return successResponse(res, result, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getCart(req, res) {
    try {
      const userId = req.user.id;
      const cart = await cartService.getCart(userId);
      return successResponse(res, cart, 'Cart retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async updateCartItem(req, res) {
    try {
      const { itemId } = req.params;
      const { quantity } = req.body;
      const userId = req.user.id;

      if (!quantity || quantity <= 0) {
        return errorResponse(res, 'Valid quantity is required', 400);
      }

      const result = await cartService.updateCartItem(userId, itemId, quantity);
      return successResponse(res, result, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async removeFromCart(req, res) {
    try {
      const { itemId } = req.params;
      const userId = req.user.id;

      const result = await cartService.removeFromCart(userId, itemId);
      return successResponse(res, result, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async clearCart(req, res) {
    try {
      const userId = req.user.id;
      const result = await cartService.clearCart(userId);
      return successResponse(res, result, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

module.exports = new CartController();