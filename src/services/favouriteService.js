const favouriteRepository = require('../repositories/favouriteRepository');

class FavouriteService {
  async toggleFavourite(userId, itemId) {
    const existing = await favouriteRepository.findByUserAndItem(userId, itemId);
    
    if (existing) {
      await favouriteRepository.delete(userId, itemId);
      return { isFavourite: false, message: 'Item removed from favourites' };
    } else {
      await favouriteRepository.create(userId, itemId);
      return { isFavourite: true, message: 'Item added to favourites' };
    }
  }

  async getUserFavourites(userId) {
    return await favouriteRepository.findByUserId(userId);
  }

  async checkIsFavourite(userId, itemId) {
    const favourite = await favouriteRepository.findByUserAndItem(userId, itemId);
    return !!favourite;
  }
}

module.exports = new FavouriteService();