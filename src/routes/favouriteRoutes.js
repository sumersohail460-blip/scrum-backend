const express = require('express');
const favouriteController = require('../controllers/favouriteController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/:itemId/toggle', authMiddleware, favouriteController.toggleFavourite);
router.get('/', authMiddleware, favouriteController.getUserFavourites);

module.exports = router;