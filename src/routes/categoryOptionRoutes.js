const express = require('express');
const categoryOptionController = require('../controllers/categoryOptionController');

const router = express.Router();

router.get('/', categoryOptionController.getCategoryOptions);
router.post('/', categoryOptionController.createCategoryOption);
router.get('/:id', categoryOptionController.getCategoryOption);
router.put('/:id', categoryOptionController.updateCategoryOption);
router.delete('/:id', categoryOptionController.deleteCategoryOption);

module.exports = router;