const express = require('express');
const itemController = require('../controllers/itemController');

const router = express.Router();

router.get('/', itemController.getItems);
router.post('/', itemController.createItem);
router.get('/:id', itemController.getItem);
router.put('/:id', itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

module.exports = router;