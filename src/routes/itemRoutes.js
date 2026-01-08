const express = require('express');
const itemController = require('../controllers/itemController');
const { uploadItemImages } = require('../middlewares/uploadMiddleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');

const router = express.Router();

router.get('/', optionalAuthMiddleware, itemController.getItems);
router.post('/', uploadItemImages, itemController.createItem);
router.get('/:id', itemController.getItem);
router.put('/:id', uploadItemImages, itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

module.exports = router;