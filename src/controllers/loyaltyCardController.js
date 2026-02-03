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
      const downloadUrl = `${req.protocol}://${req.get('host')}/api/loyalty-card/public/apple-wallet/${barcode}/download`;
      
      // Direct redirect to download
      return res.redirect(downloadUrl);
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
      
      // Generate strip image with 2 rows of stamps
      const { createCanvas, loadImage } = require('canvas');
      const totalStamps = loyaltyCard.totalItems || 0;
      
      const canvas = createCanvas(750, 246);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgb(122, 127, 58)';
      ctx.fillRect(0, 0, 750, 246);
      
      const emptyImg = await loadImage(path.join(__dirname, '../../public/assets/empty.png'));
      const filledImg = await loadImage(path.join(__dirname, '../../public/assets/filled.png'));
      const freeImg = await loadImage(path.join(__dirname, '../../public/assets/free.png'));
      
      const startX = 75;
      const startY = 30;
      const spacing = 130;
      const rowSpacing = 123;
      
      for (let i = 0; i < 10; i++) {
        const x = startX + (i % 5) * spacing;
        const y = startY + Math.floor(i / 5) * rowSpacing;
        let img;
        if (i === 9) {
          img = freeImg;
        } else if (i < totalStamps) {
          img = filledImg;
        } else {
          img = emptyImg;
        }
        ctx.drawImage(img, x, y, 100, 100);
      }
      
      const stripBuffer = canvas.toBuffer('image/png');
      pass.addBuffer('strip.png', stripBuffer);
      pass.addBuffer('strip@2x.png', stripBuffer);
      
      pass.secondaryFields.push({
        key: 'message',
        label: '',
        value: 'Every cup brings you closer to free!'
      });
      
      
      
      pass.barcodes = [{
        format: 'PKBarcodeFormatQR',
        message: loyaltyCard.barcode,
        messageEncoding: 'iso-8859-1',
        altText: loyaltyCard.cardNumber
      }];
      
      console.log('[Apple Pass] Barcode set:', loyaltyCard.barcode);
      console.log('[Apple Pass] Barcodes array:', pass.barcodes);
      
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