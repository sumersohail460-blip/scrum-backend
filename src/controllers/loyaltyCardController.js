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
      console.log('=== GET Loyalty Card Request ===');
      console.log('User ID:', req.user?.id);
      
      const userId = req.user.id;
      let loyaltyCard = await loyaltyCardService.getLoyaltyCardByUserId(userId);
      
      // If card doesn't exist, create one
      if (!loyaltyCard) {
        console.log('No card found, creating new one...');
        loyaltyCard = await loyaltyCardService.createLoyaltyCard(userId);
      }
      
      // Generate Google Wallet token
      const googleWalletToken = await loyaltyCardService.generateGoogleWalletPass(loyaltyCard);
      const googleWalletUrl = `https://pay.google.com/gp/v/save/${googleWalletToken}`;
      
      return successResponse(res, {
        loyaltyCard,
        googleWalletUrl,
        message: 'Open googleWalletUrl to add to wallet'
      }, 'Loyalty card ready');
    } catch (error) {
      console.error('Error:', error.message);
      return badResponse(res, error.message, 400);
    }
  }

  // Public API - No auth required
  async createPublicLoyaltyCard(req, res) {
    try {
      const { name, email, phone } = req.body;
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      // If token provided in header, verify and get user
      if (token) {
        try {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          
          // User is verified, get or create card
          let loyaltyCard = await loyaltyCardService.getLoyaltyCardByUserId(decoded.id);
          
          if (!loyaltyCard) {
            loyaltyCard = await loyaltyCardService.createLoyaltyCard(decoded.id);
          }
          
          return successResponse(res, {
            loyaltyCard,
            walletLinks: {
              appleWallet: `${req.protocol}://${req.get('host')}/api/loyalty-card/public/apple-wallet/${loyaltyCard.barcode}`,
              googleWallet: `${req.protocol}://${req.get('host')}/api/loyalty-card/public/google-wallet/${loyaltyCard.barcode}`
            },
            verified: true
          }, 'Loyalty card retrieved successfully', 200);
        } catch (error) {
          console.error('Token verification failed:', error);
        }
      }
      
      if (!name || (!email && !phone)) {
        return badResponse(res, 'Name and either email or phone is required', 400);
      }

      const loyaltyCard = await loyaltyCardService.createPublicLoyaltyCard({ name, email, phone });
      
      return successResponse(res, {
        loyaltyCard,
        walletLinks: {
          appleWallet: `${req.protocol}://${req.get('host')}/api/loyalty-card/public/apple-wallet/${loyaltyCard.barcode}`,
          googleWallet: `${req.protocol}://${req.get('host')}/api/loyalty-card/public/google-wallet/${loyaltyCard.barcode}`
        },
        verified: false
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
      
      // const html = `
      //   <!DOCTYPE html>
      //   <html>
      //   <head>
      //     <meta charset="UTF-8">
      //     <meta name="viewport" content="width=device-width, initial-scale=1.0">
      //     <title>Add to Apple Wallet</title>
      //     <style>
      //       * { margin: 0; padding: 0; box-sizing: border-box; }
      //       body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 20px; }
      //       .card { max-width: 400px; margin: 20px auto; background: #3c2719; color: white; border-radius: 15px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      //       .header { text-align: center; margin-bottom: 30px; }
      //       .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
      //       .points { font-size: 48px; font-weight: bold; text-align: center; margin: 20px 0; }
      //       .label { font-size: 12px; opacity: 0.8; margin-bottom: 5px; }
      //       .value { font-size: 18px; margin-bottom: 20px; }
      //       .barcode { background: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
      //       .barcode-text { color: #3c2719; font-family: monospace; font-size: 14px; word-break: break-all; }
      //       .info { text-align: center; color: #666; font-size: 14px; margin-top: 20px; background: white; padding: 20px; border-radius: 10px; }
      //       .wallet-btn { width: calc(100% - 40px); max-width: 400px; margin: 20px auto; display: block; background: black; color: white; padding: 15px; border: none; border-radius: 10px; font-size: 16px; font-weight: bold; cursor: pointer; text-align: center; text-decoration: none; }
      //     </style>
      //   </head>
      //   <body>
      //     <div class="card">
      //       <div class="header">
      //         <div class="logo">☕ Scrum Coffee</div>
      //         <div style="opacity: 0.8;">Loyalty Card</div>
      //       </div>
            
      //       <div class="points">${loyaltyCard.points}</div>
      //       <div style="text-align: center; opacity: 0.8; margin-bottom: 30px;">Points</div>
            
      //       <div class="label">Tier</div>
      //       <div class="value">${loyaltyCard.tier}</div>
            
      //       <div class="label">Card Number</div>
      //       <div class="value">${loyaltyCard.cardNumber}</div>
            
      //       <div class="barcode">
      //         <div class="barcode-text">${loyaltyCard.barcode}</div>
      //       </div>
      //     </div>
          
      //     <a href="${req.protocol}://${req.get('host')}/api/loyalty-card/public/apple-wallet/${barcode}/download" class="wallet-btn" style="display: inline-block;">
      //       🍎 Add to Apple Wallet
      //     </a>
          
      //     <div class="info">
      //       <p><strong>Your Digital Loyalty Card</strong></p>
      //       <p style="margin-top: 10px;">Show this card at checkout to earn points!</p>
      //     </div>
      //   </body>
      //   </html>
      // `;
      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Scrum Loyalty Card</title>

  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 20px;
      background: #f4f4f4;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .card {
      max-width: 420px;
      margin: auto;
      background: #7a7f3a;
      color: #fff;
      border-radius: 20px;
      padding: 20px;
      position: relative;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
    }

    .logo {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #5c612b;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    .title {
      font-size: 18px;
      font-weight: 600;
    }

    .stamps {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 14px;
      margin: 20px 0;
    }

    .stamp {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      border: 2px dashed rgba(255,255,255,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      opacity: 0.4;
    }

    .stamp.active {
      background: #fff;
      color: #6b6f2e;
      border: none;
      opacity: 1;
    }

    .free {
      background: #6b6f2e;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 600;
    }

    .text {
      text-align: center;
      font-size: 14px;
      margin: 10px 0 15px;
      opacity: 0.9;
    }

    .qr {
      background: #fff;
      padding: 10px;
      border-radius: 12px;
      width: fit-content;
      margin: auto;
    }

    .wallet-btn {
      margin-top: 20px;
      display: block;
      background: #000;
      color: #fff;
      text-align: center;
      padding: 14px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>

<body>

  <div class="card">
    <div class="header">
      <div class="logo">☕</div>
      <div class="title">Scrum Loyalty Card</div>
    </div>

    <div class="stamps">
      ${
        Array.from({ length: 5 }).map((_, i) =>
          `<div class="stamp ${i < loyaltyCard.totalItems ? 'active' : ''}">
            <img src="/assets/${i < loyaltyCard.totalItems ? 'filled' : 'empty'}.png" style="width: 40px; height: 40px;" />
          </div>`
        ).join('')
      }
    </div>
    <div class="stamps">
      ${
        Array.from({ length: 4 }).map((_, i) =>
          `<div class="stamp ${(i + 5) < loyaltyCard.totalItems ? 'active' : ''}">
            <img src="/assets/${(i + 5) < loyaltyCard.totalItems ? 'filled' : 'empty'}.png" style="width: 40px; height: 40px;" />
          </div>`
        ).join('')
      }
      <div class="free">
        <img src="/assets/gift.png" style="width: 30px; height: 30px;" />
      </div>
    </div>

    <div class="text">
      Every cup brings you closer to a free one-!
    </div>

    <div class="qr">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${loyaltyCard.barcode}" />
    </div>
  </div>

  <a class="wallet-btn"
     href="${req.protocol}://${req.get('host')}/api/loyalty-card/public/apple-wallet/${barcode}/download">
    🍎 Add to Apple Wallet
  </a>

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
      console.log('[Apple Pass] Downloading for barcode:', barcode);
      
      const { PKPass } = require('passkit-generator');
      const fs = require('fs');
      const path = require('path');
      
      const loyaltyCard = await loyaltyCardService.getLoyaltyCardByBarcode(barcode);
      console.log('[Apple Pass] Loyalty card found:', loyaltyCard.cardNumber);
      
      const modelPath = path.resolve('./pass.model');
      console.log('[Apple Pass] Model path:', modelPath);
      
      const certPath = path.resolve(process.env.APPLE_CERTIFICATE_PATH);
      const keyPath = path.resolve(process.env.APPLE_KEY_PATH);
      const wwdrPath = path.resolve(process.env.APPLE_WWDR_CERTIFICATE_PATH);
      
      console.log('[Apple Pass] Certificate path:', certPath, '- Exists:', fs.existsSync(certPath));
      console.log('[Apple Pass] Key path:', keyPath, '- Exists:', fs.existsSync(keyPath));
      console.log('[Apple Pass] WWDR path:', wwdrPath, '- Exists:', fs.existsSync(wwdrPath));
      
      console.log('Icon exists:', fs.existsSync(path.join(modelPath, 'icon.png')));
      console.log('Icon@2x exists:', fs.existsSync(path.join(modelPath, 'icon@2x.png')));
      console.log('Icon@3x exists:', fs.existsSync(path.join(modelPath, 'icon@3x.png')));
      console.log('Logo exists:', fs.existsSync(path.join(modelPath, 'logo.png')));
      console.log('Logo@2x exists:', fs.existsSync(path.join(modelPath, 'logo@2x.png')));
      console.log('pass.json exists:', fs.existsSync(path.join(modelPath, 'pass.json')));
      
      const pass = new PKPass(
        { model: modelPath },
        {
          signerCert: fs.readFileSync(certPath),
          signerKey: fs.readFileSync(keyPath),
          wwdr: fs.readFileSync(wwdrPath)
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
      console.log('[Apple Pass] Buffer generated, size:', buffer.length);
      
      res.set({
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="scrum-loyalty-${loyaltyCard.cardNumber}.pkpass"`,
        'Content-Length': buffer.length
      });
      
      return res.send(buffer);
    } catch (error) {
      console.error('[Apple Wallet Download Error]:', error);
      console.error('[Apple Wallet Error Stack]:', error.stack);
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

  async getLoyaltyCardItems(req, res) {
    try {
      const userId = req.user.id;
      const data = await loyaltyCardService.getLoyaltyCardItems(userId);
      
      return successResponse(res, data, 'Loyalty card items retrieved successfully');
    } catch (error) {
      return badResponse(res, error.message, 404);
    }
  }
}

module.exports = new LoyaltyCardController();