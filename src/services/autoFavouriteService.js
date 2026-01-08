const orderRepository = require('../repositories/orderRepository');
const favouriteRepository = require('../repositories/favouriteRepository');

class AutoFavouriteService {
  async checkAndAddToFavourites(userId, itemId) {
    try {
      // Count how many times this user has ordered this item
      const orderCount = await orderRepository.countUserItemOrders(userId, itemId);
      
      if (orderCount >= 3) {
        // Check if item is already in favourites
        const existingFavourite = await favouriteRepository.findUserFavourite(userId, itemId);
        
        if (!existingFavourite) {
          // Add to favourites
          await favouriteRepository.addToFavourites(userId, itemId);
          console.log(`Item ${itemId} automatically added to favourites for user ${userId}`);
        }
      }
    } catch (error) {
      console.error('Error in auto-favourite check:', error);
    }
  }
}

module.exports = new AutoFavouriteService();