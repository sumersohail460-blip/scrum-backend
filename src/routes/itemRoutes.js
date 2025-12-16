const express = require('express');
const itemController = require('../controllers/itemController');
const { uploadItemImage } = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.get('/', itemController.getItems);
router.post('/', uploadItemImage, itemController.createItem);
router.get('/:id', itemController.getItem);
router.put('/:id', uploadItemImage, itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

module.exports = router;