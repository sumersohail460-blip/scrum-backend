const express = require('express');
const itemController = require('../controllers/itemController');
const { uploadItemImages } = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.get('/', itemController.getItems);
router.post('/', uploadItemImages, itemController.createItem);
router.get('/:id', itemController.getItem);
router.put('/:id', uploadItemImages, itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

module.exports = router;