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
      
      // Generate Apple Wallet URL
      const appleWalletUrl = `${req.protocol}://${req.get('host')}/api/loyalty-card/public/apple-wallet/${loyaltyCard.barcode}/download`;
      
      return successResponse(res, {
        loyaltyCard,
        googleWalletUrl,
        appleWalletUrl,
        message: 'Open googleWalletUrl or appleWalletUrl to add to wallet'
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
      
      const downloadUrl = `${req.protocol}://${req.get('host')}/api/loyalty-card/public/apple-wallet/${barcode}/download`;
      console.log('===========================================');
      console.log('[Apple Wallet] Download URL:', downloadUrl);
      console.log('[Apple Wallet] Barcode:', barcode);
      console.log('[Apple Wallet] Card Number:', loyaltyCard.cardNumber);
      console.log('===========================================');
      
      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Scrum Loyalty Card</title>

  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      min-height: 100vh;
    }

    .card {
      max-width: 400px;
      margin: 20px auto;
      background: #3c2719;
      color: #fff;
      border-radius: 20px;
      padding: 25px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }

    .header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid rgba(255,255,255,0.2);
    }

    .logo {
      font-size: 48px;
      margin-bottom: 8px;
    }

    .title {
      font-size: 20px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .stamps {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
      margin: 20px 0;
    }

    .stamp {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 50%;
      border: 2px dashed rgba(255,255,255,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      background: rgba(255,255,255,0.05);
    }

    .stamp.active {
      background: #fff;
      border: none;
      animation: pop 0.3s ease;
    }

    @keyframes pop {
      0% { transform: scale(0.8); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    .free {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      box-shadow: 0 4px 15px rgba(245,87,108,0.4);
    }

    .info-section {
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 15px;
      margin: 20px 0;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .info-label {
      font-size: 12px;
      opacity: 0.7;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .info-value {
      font-size: 16px;
      font-weight: 600;
    }

    .text {
      text-align: center;
      font-size: 14px;
      margin: 15px 0;
      opacity: 0.9;
      font-style: italic;
    }

    .qr {
      background: #fff;
      padding: 15px;
      border-radius: 15px;
      width: fit-content;
      margin: 20px auto;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }

    .wallet-btn {
      margin-top: 20px;
      display: block;
      background: #000;
      color: #fff;
      text-align: center;
      padding: 16px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      transition: transform 0.2s;
    }

    .wallet-btn:active {
      transform: scale(0.98);
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
            ${i < loyaltyCard.totalItems ? '☕' : ''}
          </div>`
        ).join('')
      }
    </div>
    <div class="stamps">
      ${
        Array.from({ length: 4 }).map((_, i) =>
          `<div class="stamp ${(i + 5) < loyaltyCard.totalItems ? 'active' : ''}">
            ${(i + 5) < loyaltyCard.totalItems ? '☕' : ''}
          </div>`
        ).join('')
      }
      <div class="free">🎁</div>
    </div>

    <div class="text">
      Every cup brings you closer to a free one!
    </div>

    <div class="info-section">
      <div class="info-row">
        <span class="info-label">Points</span>
        <span class="info-value">${loyaltyCard.points}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Tier</span>
        <span class="info-value">${loyaltyCard.tier}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Card Number</span>
        <span class="info-value">${loyaltyCard.cardNumber}</span>
      </div>
    </div>

    <div class="qr">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${loyaltyCard.barcode}" />
    </div>
  </div>

  <a class="wallet-btn"
     href="https://${req.get('host')}/api/loyalty-card/public/apple-wallet/${barcode}/download">
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
      
      console.log('[Apple Pass] Pass Type ID:', process.env.APPLE_PASS_TYPE_ID);
      console.log('[Apple Pass] Team ID:', process.env.APPLE_TEAM_ID);
      
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
          wwdr: fs.readFileSync(wwdrPath),
          signerKeyPassphrase: process.env.APPLE_CERTIFICATE_PASSWORD || '1234'
        },
        {
          serialNumber: `${loyaltyCard.cardNumber}-${Date.now()}`,
          description: 'Scrum Coffee Loyalty Card',
          organizationName: 'Scrum Coffee',
          passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID,
          teamIdentifier: process.env.APPLE_TEAM_ID,
          backgroundColor: 'rgb(122, 127, 58)',
          foregroundColor: 'rgb(255, 255, 255)',
          logoText: 'Scrum Coffee'
        }
      );

      // Add images manually
      pass.addBuffer('icon.png', fs.readFileSync(path.join(modelPath, 'icon.png')));
      pass.addBuffer('icon@2x.png', fs.readFileSync(path.join(modelPath, 'icon@2x.png')));
      pass.addBuffer('icon@3x.png', fs.readFileSync(path.join(modelPath, 'icon@3x.png')));
      pass.addBuffer('logo.png', fs.readFileSync(path.join(modelPath, 'logo.png')));
      pass.addBuffer('logo@2x.png', fs.readFileSync(path.join(modelPath, 'logo@2x.png')));
      if (fs.existsSync(path.join(modelPath, 'logo@3x.png'))) {
        pass.addBuffer('logo@3x.png', fs.readFileSync(path.join(modelPath, 'logo@3x.png')));
      }

      pass.type = 'storeCard';
      
      // Create stamps visual exactly like Google Wallet
      const totalStamps = loyaltyCard.totalItems || 0;
      const icons = [];
      for (let i = 1; i <= 10; i++) {
        if (i === 10) {
          icons.push('🎁');
        } else if (i <= totalStamps) {
          icons.push('☕');
        } else {
          icons.push('🚫');
        }
      }
      const row1 = icons.slice(0, 5).join('  ');
      const row2 = icons.slice(5, 10).join('  ');
      
      pass.primaryFields.push({
        key: 'row1',
        value: row1
      });

      pass.secondaryFields.push({
        key: 'row2',
        value: row2
      });
      
      pass.backFields.push({
        key: 'message',
        label: '',
        value: 'Every cup brings you closer to free!'
      });
      
      pass.backFields.push({
        key: 'cardNumber',
        label: 'Card Number',
        value: loyaltyCard.cardNumber
      });
      
      pass.backFields.push({  
        key: 'points',
        label: 'Points',
        value: loyaltyCard.points.toString()
      });
      
      pass.backFields.push({
        key: 'tier',
        label: 'Tier',
        value: loyaltyCard.tier
      });

      pass.barcodes = [{
        format: 'PKBarcodeFormatQR',
        message: loyaltyCard.barcode,
        messageEncoding: 'iso-8859-1',
        altText: loyaltyCard.cardNumber
      }];

      const buffer = pass.getAsBuffer();
      console.log('[Apple Pass] Buffer generated, size:', buffer.length);
      
      // Save locally for testing
      const testPath = path.resolve(`./test-pass-${loyaltyCard.cardNumber}.pkpass`);
      fs.writeFileSync(testPath, buffer);
      console.log('[Apple Pass] Test file saved at:', testPath);
      
      console.log('[Apple Pass] Sending response...');
      
      const downloadUrl = `${req.protocol}://${req.get('host')}/api/loyalty-card/public/apple-wallet/${barcode}/download`;
      console.log('[Apple Pass] Download URL for iPhone:', downloadUrl);
      
      res.writeHead(200, {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="scrum-loyalty.pkpass"`,
        'Content-Length': buffer.length
      });

      res.end(buffer);
      console.log('[Apple Pass] Response sent successfully');
    } catch (error) {
      console.error('[Apple Wallet Download Error]:', error.message);
      console.error('[Apple Wallet Error Stack]:', error.stack);
      if (!res.headersSent) {
        return badResponse(res, error.message, 400);
      }
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