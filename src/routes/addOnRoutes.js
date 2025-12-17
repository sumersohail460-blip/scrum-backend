const express = require('express');
const addOnController = require('../controllers/addOnController');

const router = express.Router();

router.get('/', addOnController.getAddOns);
router.post('/', addOnController.createAddOn);
router.get('/:id', addOnController.getAddOn);
router.put('/:id', addOnController.updateAddOn);
router.delete('/:id', addOnController.deleteAddOn);

module.exports = router;