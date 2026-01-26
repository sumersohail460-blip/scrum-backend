const loyaltyCardService = require('../services/loyaltyCardService');
const { successResponse, badResponse } = require('../utils/apiResponseUtil');

class LoyaltyCardController {
  async createLoyaltyCard(req, res) {
    try {
      const userId = req.user.id;
      const loyaltyCard = await loyaltyCardService.createLoyaltyCard(userId);
      
      return successResponse(res, loyaltyCard, 'Loyalty card created successfully', 201);
    } catch (error) {
      return badResponse(res, error.message, 400);
    }
  }

  async getLoyaltyCard(req, res) {
    try {
      const userId = req.user.id;
      const loyaltyCard = await loyaltyCardService.getLoyaltyCard(userId);
      
      return successResponse(res, loyaltyCard, 'Loyalty card retrieved successfully');
    } catch (error) {
      return badResponse(res, error.message, 404);
    }
  }

  // Public API - No auth required
  async createPublicLoyaltyCard(req, res) {
    try {
      const { name, email, phone } = req.body;
      
      if (!name || (!email && !phone)) {
        return badResponse(res, 'Name and either email or phone is required', 400);
      }

      const loyaltyCard = await loyaltyCardService.createPublicLoyaltyCard({ name, email, phone });
      
      return successResponse(res, {
        loyaltyCard,
        walletLinks: {
          appleWallet: `${req.protocol}://${req.get('host')}/api/loyalty-card/public/apple-wallet/${loyaltyCard.barcode}`,
          googleWallet: `${req.protocol}://${req.get('host')}/api/loyalty-card/public/google-wallet/${loyaltyCard.barcode}`
        }
      }, 'Loyalty card created successfully', 201);
    } catch (error) {
      return badResponse(res, error.message, 400);
    }
  }

  // Public API - Get card by barcode
  async getPublicLoyaltyCard(req, res) {
    try {
      const { barcode } = req.params;
      const loyaltyCard = await loyaltyCardService.getLoyaltyCardByBarcode(barcode);
      
      return successResponse(res, {
        loyaltyCard,
        walletLinks: {
          appleWallet: `${req.protocol}://${req.get('host')}/api/loyalty-card/public/apple-wallet/${barcode}`,
          googleWallet: `${req.protocol}://${req.get('host')}/api/loyalty-card/public/google-wallet/${barcode}`
        }
      }, 'Loyalty card retrieved successfully');
    } catch (error) {
      return badResponse(res, error.message, 404);
    }
  }

  // Public Apple Wallet - No auth required
  async addToAppleWalletPublic(req, res) {
    try {
      const { barcode } = req.params;
      const loyaltyCard = await loyaltyCardService.getLoyaltyCardByBarcode(barcode);
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Add to Apple Wallet</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 20px; }
            .card { max-width: 400px; margin: 20px auto; background: #3c2719; color: white; border-radius: 15px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .points { font-size: 48px; font-weight: bold; text-align: center; margin: 20px 0; }
            .label { font-size: 12px; opacity: 0.8; margin-bottom: 5px; }
            .value { font-size: 18px; margin-bottom: 20px; }
            .barcode { background: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
            .barcode-text { color: #3c2719; font-family: monospace; font-size: 14px; word-break: break-all; }
            .info { text-align: center; color: #666; font-size: 14px; margin-top: 20px; background: white; padding: 20px; border-radius: 10px; }
            .wallet-btn { width: calc(100% - 40px); max-width: 400px; margin: 20px auto; display: block; background: black; color: white; padding: 15px; border: none; border-radius: 10px; font-size: 16px; font-weight: bold; cursor: pointer; text-align: center; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <div class="logo">☕ Scrum Coffee</div>
              <div style="opacity: 0.8;">Loyalty Card</div>
            </div>
            
            <div class="points">${loyaltyCard.points}</div>
            <div style="text-align: center; opacity: 0.8; margin-bottom: 30px;">Points</div>
            
            <div class="label">Tier</div>
            <div class="value">${loyaltyCard.tier}</div>
            
            <div class="label">Card Number</div>
            <div class="value">${loyaltyCard.cardNumber}</div>
            
            <div class="barcode">
              <div class="barcode-text">${loyaltyCard.barcode}</div>
            </div>
          </div>
          
          <a href="${req.protocol}://${req.get('host')}/api/loyalty-card/public/apple-wallet/${barcode}/download" class="wallet-btn" style="display: inline-block;">
            🍎 Add to Apple Wallet
          </a>
          
          <div class="info">
            <p><strong>Your Digital Loyalty Card</strong></p>
            <p style="margin-top: 10px;">Show this card at checkout to earn points!</p>
          </div>
        </body>
        </html>
      `;
      
      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    } catch (error) {
      console.error('[Apple Wallet Error]:', error);
      return badResponse(res, error.message, 400);
    }
  }

  // Download .pkpass file
  async downloadApplePass(req, res) {
    try {
      const { barcode } = req.params;
      const { PKPass } = require('passkit-generator');
      const fs = require('fs');
      const path = require('path');
      
      const loyaltyCard = await loyaltyCardService.getLoyaltyCardByBarcode(barcode);
      
      const modelPath = path.resolve('./pass.model');
      
      const pass = new PKPass(
        { model: modelPath },
        {
          signerCert: fs.readFileSync(path.resolve(process.env.APPLE_CERTIFICATE_PATH)),
          signerKey: fs.readFileSync(path.resolve(process.env.APPLE_KEY_PATH)),
          wwdr: fs.readFileSync(path.resolve(process.env.APPLE_WWDR_CERTIFICATE_PATH))
        },
        {
          serialNumber: loyaltyCard.cardNumber,
          description: 'Scrum Coffee Loyalty Card',
          organizationName: 'Scrum Coffee',
          passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID,
          teamIdentifier: process.env.APPLE_TEAM_ID,
          backgroundColor: 'rgb(60, 39, 25)',
          foregroundColor: 'rgb(255, 255, 255)',
          logoText: 'Scrum Coffee'
        }
      );

      pass.type = 'storeCard';
      pass.headerFields.push({
        key: 'points',
        label: 'Points',
        value: loyaltyCard.points.toString()
      });
      
      pass.secondaryFields.push({
        key: 'tier',
        label: 'Tier',
        value: loyaltyCard.tier
      });
      
      pass.secondaryFields.push({
        key: 'cardNumber',
        label: 'Card Number',
        value: loyaltyCard.cardNumber
      });

      pass.barcodes = [{
        format: 'PKBarcodeFormatQR',
        message: loyaltyCard.barcode,
        messageEncoding: 'iso-8859-1'
      }];

      const buffer = pass.getAsBuffer();
      
      res.set({
        'Content-Type': 'application/vnd.apple.pkpass'
      });
      
      return res.send(buffer);
    } catch (error) {
      console.error('[Apple Wallet Download Error]:', error);
      return badResponse(res, error.message, 400);
    }
  }

  // Public Google Wallet - No auth required
  async addToGoogleWalletPublic(req, res) {
    try {
      const { barcode } = req.params;
      console.log('[Controller] Barcode:', barcode);
      
      const jwtToken = await loyaltyCardService.getPublicWalletPassData(barcode, 'google');
      console.log('[Controller] JWT Token received, length:', jwtToken.length);
      console.log('[Controller] JWT Token (first 100):', jwtToken.substring(0, 100));
      
      const saveUrl = `https://pay.google.com/gp/v/save/${jwtToken}`;
      console.log('[Controller] Redirect URL:', saveUrl);
      console.log('[Controller] Redirecting to Google Pay...');
      
      return res.redirect(saveUrl);
    } catch (error) {
      console.error('[Controller ERROR]:', error.message);
      console.error('[Controller ERROR Stack]:', error.stack);
      return badResponse(res, error.message, 400);
    }
  }

  // Debug endpoint - View JWT payload
  async debugGoogleWalletToken(req, res) {
    try {
      const { barcode } = req.params;
      const loyaltyCard = await loyaltyCardService.getLoyaltyCardByBarcode(barcode);
      
      const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID || '3388000000023073122';
      const classId = `${issuerId}.scrum_coffee_loyalty_class`;
      
      const payload = {
        iss: process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL || 'scrum-coffee@scrum-coffee.iam.gserviceaccount.com',
        aud: 'google',
        typ: 'savetowallet',
        iat: Math.floor(Date.now() / 1000),
        payload: {
          loyaltyClasses: [{
            id: classId,
            issuerName: 'Scrum Coffee',
            reviewStatus: 'UNDER_REVIEW',
            programName: 'Scrum Coffee Loyalty',
            hexBackgroundColor: '#3c2719'
          }],
          loyaltyObjects: [{
            id: `${issuerId}.${loyaltyCard.barcode}`,
            classId: classId,
            state: 'ACTIVE',
            accountName: loyaltyCard.user?.name || 'Member',
            accountId: loyaltyCard.cardNumber,
            loyaltyPoints: {
              balance: {
                string: loyaltyCard.points.toString()
              },
              label: 'Points'
            }
          }]
        }
      };
      
      return successResponse(res, {
        payload,
        hasPrivateKey: !!process.env.GOOGLE_WALLET_PRIVATE_KEY,
        serviceAccountEmail: process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL,
        issuerId: issuerId
      }, 'Debug info');
    } catch (error) {
      return badResponse(res, error.message, 400);
    }
  }

  // Setup endpoint - Create Google Wallet Class
  async setupGoogleWalletClass(req, res) {
    try {
      const result = await loyaltyCardService.createGoogleWalletClass();
      return successResponse(res, result, 'Google Wallet class setup completed', 200);
    } catch (error) {
      return badResponse(res, error.message, 400);
    }
  }

  async addToAppleWallet(req, res) {
    try {
      const userId = req.user.id;
      const passData = await loyaltyCardService.getWalletPassData(userId, 'apple');
      
      res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
      res.setHeader('Content-Disposition', 'attachment; filename="loyalty-card.pkpass"');
      
      return successResponse(res, {
        passData,
        downloadUrl: `/api/loyalty-card/apple-wallet/download`,
        message: 'Click to add to Apple Wallet'
      }, 'Apple Wallet pass generated successfully');
    } catch (error) {
      return badResponse(res, error.message, 400);
    }
  }

  async addToGoogleWallet(req, res) {
    try {
      const userId = req.user.id;
      const passData = await loyaltyCardService.getWalletPassData(userId, 'google');
      
      const saveUrl = `https://pay.google.com/gp/v/save/${Buffer.from(JSON.stringify(passData)).toString('base64')}`;
      
      return successResponse(res, {
        passData,
        saveUrl,
        message: 'Click to add to Google Wallet'
      }, 'Google Wallet pass generated successfully');
    } catch (error) {
      
      return badResponse(res, error.message, 400);
    }
  }

  async getWalletOptions(req, res) {
    try {
      const userId = req.user.id;
      const loyaltyCard = await loyaltyCardService.getLoyaltyCard(userId);
      
      const walletOptions = {
        loyaltyCard: {
          id: loyaltyCard.id,
          cardNumber: loyaltyCard.cardNumber,
          points: loyaltyCard.points,
          tier: loyaltyCard.tier,
          barcode: loyaltyCard.barcode
        },
        walletLinks: {
          appleWallet: `/api/loyalty-card/apple-wallet`,
          googleWallet: `/api/loyalty-card/google-wallet`
        }
      };
      
      return successResponse(res, walletOptions, 'Wallet options retrieved successfully');
    } catch (error) {
      return badResponse(res, error.message, 400);
    }
  }
}

module.exports = new LoyaltyCardController();