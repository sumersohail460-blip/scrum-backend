const express = require('express');
const router = express.Router();
const loyaltyCardController = require('../controllers/loyaltyCardController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public APIs - No authentication required
router.post('/public/create', loyaltyCardController.createPublicLoyaltyCard);
router.get('/public/:barcode', loyaltyCardController.getPublicLoyaltyCard);
router.get('/public/apple-wallet/:barcode', loyaltyCardController.addToAppleWalletPublic);
router.get('/public/apple-wallet/:barcode/download', loyaltyCardController.downloadApplePass);
router.get('/public/google-wallet/:barcode', loyaltyCardController.addToGoogleWalletPublic);
router.get('/public/debug-google-wallet/:barcode', loyaltyCardController.debugGoogleWalletToken);

// Setup endpoint - Create Google Wallet Class (one-time setup)
router.post('/setup/google-wallet-class', loyaltyCardController.setupGoogleWalletClass);

// Unified endpoint - works with or without auth
router.post('/', loyaltyCardController.createPublicLoyaltyCard);
router.get('/', authMiddleware, loyaltyCardController.getLoyaltyCard);
router.get('/items', authMiddleware, loyaltyCardController.getLoyaltyCardItems);

// Public APIs - No authentication required
router.post('/public/create', loyaltyCardController.createPublicLoyaltyCard);
router.get('/wallet-options', authMiddleware, loyaltyCardController.getWalletOptions);
router.get('/apple-wallet', authMiddleware, loyaltyCardController.addToAppleWallet);
router.get('/google-wallet', authMiddleware, loyaltyCardController.addToGoogleWallet);

module.exports = router;