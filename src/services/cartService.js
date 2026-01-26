const cartRepository = require('../repositories/cartRepository');
const itemRepository = require('../repositories/itemRepository');

class CartService {
  async addToCart(userId, itemId, quantity = 1, selectedOptions = [], selectedAddOns = []) {
    // Convert quantity to integer
    quantity = parseInt(quantity) || 1;
    
    // Check if item exists
    const item = await itemRepository.findById(itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    // Find or create user cart
    let cart = await cartRepository.findUserCart(userId);
    if (!cart) {
      cart = await cartRepository.createCart(userId);
    }

    // Check if item already exists in cart
    const existingItem = (cart.cartItems || []).find(cartItem => cartItem.itemId === itemId);
    
    if (existingItem) {
      // Check stock availability
      if (item.stock < quantity) {
        throw new Error(`Cannot set quantity to ${quantity}. Available stock: ${item.stock}`);
      }
      
      // Remove existing item and add new one with updated options/addons
      await cartRepository.removeItemFromCart(cart.id, itemId);
      const cartItem = await cartRepository.addItemToCart(cart.id, itemId, quantity, selectedOptions, selectedAddOns);
      return {
        message: 'Item updated in cart.',
        cartItem
      };
    } else {
      // Check stock availability
      if (item.stock < quantity) {
        throw new Error('Insufficient stock available');
      }
      
      // Add new item to cart
      const cartItem = await cartRepository.addItemToCart(cart.id, itemId, quantity, selectedOptions, selectedAddOns);
      return {
        message: 'Item added to cart successfully',
        cartItem
      };
    }
  }

  async getCart(userId, paymentMethod = null) {
    const cart = await cartRepository.findUserCart(userId);
    if (!cart) {
      return {
        cartItems: [],
        totalItems: 0,
        subTotal: 0,
        platformFee: 20,
        cardGst: 0,
        grandTotal: 20
      };
    }

    const totalItems = cart.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subTotal = cart.cartItems.reduce((sum, cartItem) => {
      let itemTotal = parseFloat(cartItem.item.currentPrice) * cartItem.quantity;
      
      // Add option prices
      if (cartItem.cartItemOptions && cartItem.cartItemOptions.length > 0) {
        cartItem.cartItemOptions.forEach(option => {
          itemTotal += parseFloat(option.categoryOption.extraPrice) * cartItem.quantity;
        });
      }
      
      // Add add-on prices
      if (cartItem.cartItemAddOns && cartItem.cartItemAddOns.length > 0) {
        cartItem.cartItemAddOns.forEach(addOn => {
          itemTotal += parseFloat(addOn.addOn.price) * cartItem.quantity;
        });
      }
      
      return sum + itemTotal;
    }, 0);

    const platformFee = 20;
    const cardGst = (paymentMethod === 'JazzCash' || paymentMethod === 'Cash') ? subTotal * 0.16 : (paymentMethod === 'CARD' ? subTotal * 0.05 : 0);
    const grandTotal = subTotal + platformFee + cardGst;

    return {
      cartItems: cart.cartItems,
      totalItems,
      subTotal: parseFloat(subTotal.toFixed(2)),
      platformFee,
      cardGst: parseFloat(cardGst.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2))
    };
  }

  async updateCartItem(userId, itemId, quantity) {
    // Convert quantity to integer
    quantity = parseInt(quantity);
    
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    const cart = await cartRepository.findUserCart(userId);
    if (!cart) {
      throw new Error('Cart not found');
    }

    // Check if item exists in cart
    const existingItem = cart.cartItems.find(item => item.itemId === itemId);
    if (!existingItem) {
      throw new Error('Item not found in cart');
    }

    // Check stock availability
    const item = await itemRepository.findById(itemId);
    if (item.stock < quantity) {
      throw new Error('Insufficient stock available');
    }

    const updatedItem = await cartRepository.updateCartItemQuantity(cart.id, itemId, quantity);
    
    return {
      message: 'Cart item updated successfully',
      cartItem: updatedItem
    };
  }

  async removeFromCart(userId, itemId) {
    const cart = await cartRepository.findUserCart(userId);
    if (!cart) {
      throw new Error('Cart not found');
    }

    // Check if item exists in cart
    const existingItem = cart.cartItems.find(item => item.itemId === itemId);
    if (!existingItem) {
      throw new Error('Item not found in cart');
    }

    await cartRepository.removeItemFromCart(cart.id, itemId);
    
    return {
      message: 'Item removed from cart successfully'
    };
  }

  async clearCart(userId) {
    const cart = await cartRepository.findUserCart(userId);
    if (!cart) {
      throw new Error('Cart not found');
    }

    await cartRepository.clearCart(cart.id);
    
    return {
      message: 'Cart cleared successfully'
    };
  }
}

module.exports = new CartService();