const express = require("express");
const router = express.Router();
const { makeJazzCashPayment, calculateCardPayment } = require("../controllers/paymentController");

// POST /api/payment/calculate-card
router.post("/calculate-card", calculateCardPayment);

// POST /api/payment
router.post("/", makeJazzCashPayment);

module.exports = router;
