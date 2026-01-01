const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// All order routes require authentication
router.use(authMiddleware);

router.get('/details', orderController.getOrderDetails);
router.post('/', orderController.createOrder);
router.get('/', orderController.getUserOrders);
router.get('/:orderId', orderController.getOrderById);
router.delete('/:orderId', orderController.deleteOrder);

module.exports = router;