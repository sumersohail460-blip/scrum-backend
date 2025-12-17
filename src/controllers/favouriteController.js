const favouriteService = require('../services/favouriteService');
const { successResponse, errorResponse } = require('../utils/apiResponseUtil');

class FavouriteController {
  async toggleFavourite(req, res) {
    try {
      const { itemId } = req.params;
      const userId = req.user.id;
      
      const result = await favouriteService.toggleFavourite(userId, itemId);
      return successResponse(res, result, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getUserFavourites(req, res) {
    try {
      const userId = req.user.id;
      const favourites = await favouriteService.getUserFavourites(userId);
      return successResponse(res, favourites, 'Favourites retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

module.exports = new FavouriteController();