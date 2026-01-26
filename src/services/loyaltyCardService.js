const loyaltyCardRepository = require('../repositories/loyaltyCardRepository');
const userRepository = require('../repositories/userRepository');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const axios = require('axios');

class LoyaltyCardService {
  generateCardNumber() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${timestamp.slice(-8)}${random}`;
  }

  generateBarcode() {
    return crypto.randomUUID().replace(/-/g, '').toUpperCase();
  }

  async getGoogleWalletAccessToken() {
    const privateKey = process.env.GOOGLE_WALLET_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('Google Wallet private key not configured');
    }

    const jwtPayload = {
      iss: process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL,
      scope: 'https://www.googleapis.com/auth/wallet_object.issuer',
      aud: 'https://oauth2.googleapis.com/token',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    };

    const token = jwt.sign(jwtPayload, privateKey.replace(/\\n/g, '\n'), { algorithm: 'RS256' });

    const response = await axios.post('https://oauth2.googleapis.com/token', {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: token
    });

    return response.data.access_token;
  }

  async createGoogleWalletClass() {
    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID || '3388000000023073122';
    const classId = `${issuerId}.scrum_coffee_loyalty_class`;

    const classPayload = {
      id: classId,
      issuerName: 'Scrum Coffee',
      reviewStatus: 'UNDER_REVIEW',
      programName: 'Scrum Coffee Loyalty',
      programLogo: {
        sourceUri: {
          uri: 'https://storage.googleapis.com/wallet-lab-tools-codelab-artifacts-public/pass_google_logo.jpg'
        },
        contentDescription: {
          defaultValue: {
            language: 'en-US',
            value: 'Scrum Coffee Logo'
          }
        }
      },
      hexBackgroundColor: '#3c2719',
      localizedIssuerName: {
        defaultValue: {
          language: 'en-US',
          value: 'Scrum Coffee'
        }
      },
      localizedProgramName: {
        defaultValue: {
          language: 'en-US',
          value: 'Scrum Coffee Loyalty'
        }
      },
      accountNameLabel: 'Member Name',
      accountIdLabel: 'Card Number',
      rewardsTier: 'BRONZE',
      rewardsTierLabel: 'Tier'
    };

    try {
      const accessToken = await this.getGoogleWalletAccessToken();
      
      const response = await axios.post(
        `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass`,
        classPayload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true, classId, data: response.data };
    } catch (error) {
      if (error.response?.status === 409) {
        return { success: true, classId, message: 'Class already exists' };
      }
      throw new Error(`Failed to create class: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async createLoyaltyCard(userId) {
    const existingCard = await loyaltyCardRepository.findByUserId(userId);
    if (existingCard) {
      throw new Error('User already has a loyalty card');
    }

    const cardData = {
      userId,
      cardNumber: this.generateCardNumber(),
      barcode: this.generateBarcode(),
      points: 0,
      tier: 'BRONZE'
    };

    return await loyaltyCardRepository.createLoyaltyCard(cardData);
  }

  async createPublicLoyaltyCard({ name, email, phone, password }) {
    const bcrypt = require('bcrypt');
    
    // Check if user exists
    let user = null;
    if (email) {
      user = await userRepository.findByEmailOrPhone(email);
    } else if (phone) {
      user = await userRepository.findByEmailOrPhone(phone);
    }

    // If user exists and password provided, verify password
    if (user && password) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }
      // Password matched, check for existing card
      const existingCard = await loyaltyCardRepository.findByUserId(user.id);
      if (existingCard) {
        return existingCard;
      }
    }

    if (!user) {
      // Create new user
      const userData = {
        name,
        isVerified: true,
        isActive: true
      };
      if (email) userData.email = email;
      if (phone) userData.phone = phone;
      
      user = await userRepository.createUser(userData);
    }

    // Check if user already has loyalty card
    const existingCard = await loyaltyCardRepository.findByUserId(user.id);
    if (existingCard) {
      return existingCard;
    }

    const cardData = {
      userId: user.id,
      cardNumber: this.generateCardNumber(),
      barcode: this.generateBarcode(),
      points: 0,
      tier: 'BRONZE'
    };

    return await loyaltyCardRepository.createLoyaltyCard(cardData);
  }

  async getLoyaltyCard(userId) {
    const card = await loyaltyCardRepository.findByUserId(userId);
    if (!card) {
      throw new Error('Loyalty card not found');
    }
    return card;
  }

  async getLoyaltyCardByBarcode(barcode) {
    const card = await loyaltyCardRepository.findByBarcode(barcode);
    if (!card) {
      throw new Error('Loyalty card not found');
    }
    return card;
  }

  generateAppleWalletPass(loyaltyCard) {
    // Apple Wallet pass structure
    return {
      formatVersion: 1,
      passTypeIdentifier: "pass.com.scrumcoffee.loyalty",
      serialNumber: loyaltyCard.cardNumber,
      teamIdentifier: "YOUR_TEAM_ID",
      organizationName: "Scrum Coffee",
      description: "Scrum Coffee Loyalty Card",
      logoText: "Scrum Coffee",
      foregroundColor: "rgb(255, 255, 255)",
      backgroundColor: "rgb(60, 39, 25)",
      storeCard: {
        primaryFields: [
          {
            key: "points",
            label: "Points",
            value: loyaltyCard.points.toString()
          }
        ],
        secondaryFields: [
          {
            key: "tier",
            label: "Tier",
            value: loyaltyCard.tier
          },
          {
            key: "cardNumber",
            label: "Card Number",
            value: loyaltyCard.cardNumber
          }
        ],
        backFields: [
          {
            key: "terms",
            label: "Terms and Conditions",
            value: "Visit scrumcoffee.com for full terms"
          }
        ]
      },
      barcode: {
        message: loyaltyCard.barcode,
        format: "PKBarcodeFormatQR",
        messageEncoding: "iso-8859-1"
      },
      locations: [
        {
          latitude: 37.7749,
          longitude: -122.4194,
          relevantText: "Welcome to Scrum Coffee!"
        }
      ]
    };
  }

  generateGoogleWalletPass(loyaltyCard) {
    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID || '3388000000023073122';
    const classId = `${issuerId}.scrum_coffee_loyalty_class`;

    // Source - https://stackoverflow.com/a
    // Posted by Jay Cee
    // Retrieved 2026-01-22, License - CC BY-SA 4.0
    const payload = {
      iss: process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL || 'scrum-coffee@scrum-coffee.iam.gserviceaccount.com',
      aud: 'google',
      typ: 'savetowallet',
      origins: ['localhost'],
      payload: {
        genericClasses: [{
          id: classId
        }],
        genericObjects: [{
          id: `${issuerId}.${loyaltyCard.barcode}`,
          classId: classId,
          cardTitle: {
            defaultValue: {
              language: 'en-US',
              value: 'Scrum Coffee Loyalty'
            }
          },
          header: {
            defaultValue: {
              language: 'en-US',
              value: loyaltyCard.user?.name || 'Member'
            }
          },
          subheader: {
            defaultValue: {
              language: 'en-US',
              value: `${loyaltyCard.points} Points`
            }
          },
          hexBackgroundColor: '#3c2719',
          barcode: {
            type: 'QR_CODE',
            value: loyaltyCard.barcode
          }
        }]
      }
    };

    // Try to sign JWT if private key exists
    try {
      const privateKey = process.env.GOOGLE_WALLET_PRIVATE_KEY;
      console.log('[JWT] Private key exists:', !!privateKey);
      if (privateKey) {
        console.log('[JWT] Private key length:', privateKey.length);
        const formattedKey = privateKey.replace(/\\n/g, '\n');
        console.log('[JWT] Attempting JWT sign...');
        const token = jwt.sign(payload, formattedKey, { algorithm: 'RS256' });
        console.log('[JWT] Success! Token generated');
        return token;
      }
    } catch (error) {
      console.error('[JWT ERROR] Signing failed:', error.message);
      console.error('[JWT ERROR] Stack:', error.stack);
    }

    console.log('[JWT] Using base64 fallback');
    const base64Token = Buffer.from(JSON.stringify(payload)).toString('base64');
    console.log('[JWT] Base64 token length:', base64Token.length);
    console.log('[JWT] Base64 token (first 100 chars):', base64Token.substring(0, 100));
    console.log('[JWT] Payload being encoded:', JSON.stringify(payload, null, 2));
    return base64Token;
  }


  async getWalletPassData(userId, walletType) {
    const loyaltyCard = await this.getLoyaltyCard(userId);
    
    if (walletType === 'apple') {
      return this.generateAppleWalletPass(loyaltyCard);
    } else if (walletType === 'google') {
      return this.generateGoogleWalletPass(loyaltyCard);
    } else {
      throw new Error('Invalid wallet type');
    }
  }

  async getPublicWalletPassData(barcode, walletType) {
    const loyaltyCard = await this.getLoyaltyCardByBarcode(barcode);
    
    if (walletType === 'apple') {
      return this.generateAppleWalletPass(loyaltyCard);
    } else if (walletType === 'google') {
      return this.generateGoogleWalletPass(loyaltyCard);
    } else {
      throw new Error('Invalid wallet type');
    }
  }
}

module.exports = new LoyaltyCardService();