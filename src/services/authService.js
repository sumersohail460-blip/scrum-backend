const userRepository = require('../repositories/userRepository');
const otpRepository = require('../repositories/otpRepository');
const { generateUserJwtToken, generateUserRefreshToken, hashPassword, comparePassword } = require('../helpers/authHelper');
const { generateOTP, createExpiryTime } = require('../utils/otpUtil');
const { badResponse } = require('../utils/apiResponseUtil');
const sendEmail = require('../utils/sendMailUtil');
const emailTemplates = require('../emailTemplates');

class AuthService {
  async register(userData) {
    const { contact, contactType, name, password } = userData;
    const { normalizePhone } = require('../helpers/contactHelper');
    const TwilioService = require('../utils/sendSmsUtil');
    
    const normalizedContact = contactType === 'phone' ? normalizePhone(contact) : contact;
    const existingUser = await userRepository.findByEmailOrPhone(normalizedContact);
    
    if (existingUser) {
      if (existingUser.isVerified) {
        const contactMethod = existingUser.email ? 'email' : 'phone number';
        throw new Error(`User already exists with this ${contactMethod}`);
      } else {
        // User exists but not verified, resend OTP
        const otp = generateOTP();
        const expiresAt = createExpiryTime(10);

        await otpRepository.create({
          userId: existingUser.id,
          code: otp,
          type: 'EMAIL_VERIFICATION',
          expiresAt
        });

        // Send OTP via email or SMS
        if (existingUser.email) {
          await sendEmail(
            existingUser.email,
            'Email Verification - OTP',
            emailTemplates.otpEmailTemplate(otp, existingUser.name)
          );
        } else if (existingUser.phone) {
          await TwilioService.sendOTPSMS(existingUser.phone, otp);
        }

        return {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          phone: existingUser.phone,
          otp: otp,
          message: `OTP resent to your ${existingUser.email ? 'email' : 'phone'}. Please verify to complete registration.`
        };
      }
    }

    const hashedPassword = await hashPassword(password);
    const userCreateData = {
      name,
      password: hashedPassword
    };
    
    if (contactType === 'email') {
      userCreateData.email = normalizedContact;
    } else {
      userCreateData.phone = normalizedContact;
    }
    
    const user = await userRepository.createUser(userCreateData);

    // Generate OTP for email verification
    const otp = generateOTP();
    const expiresAt = createExpiryTime(10);

    await otpRepository.create({
      userId: user.id,
      code: otp,
      type: 'EMAIL_VERIFICATION',
      expiresAt
    });

    // Send OTP via email or SMS
    if (user.email) {
      await sendEmail(
        user.email,
        // 'Welcome to Scrum - Email Verification',
        'Email Verification',
        emailTemplates.otpEmailTemplate(otp, user.name)
      );
    } else if (user.phone) {
      await TwilioService.sendOTPSMS(user.phone, otp);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      otp: otp,
      message: `Registration successful. Please check your ${user.email ? 'email' : 'phone'} for OTP verification.`
    };
  }

  async loginUser(userData) {
    const { contact, contactType, password } = userData;
    const { normalizePhone } = require('../helpers/contactHelper');
    
    const normalizedContact = contactType === 'phone' ? normalizePhone(contact) : contact;
    const user = await userRepository.findByEmailOrPhone(normalizedContact);
    
    if (!user) {
      return badResponse('Invalid credentials', 401);
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return badResponse('Invalid credentials', 401);
    }

    if (!user.isVerified) {
      return badResponse('Please verify your email first', 400);
    }

    if (!user.isActive) {
      return badResponse('User is inactive, Please contact admin', 400);
    }

    // Update last login
    await userRepository.updateUser(user.id, { lastLoginAt: new Date() });

    const accessToken = await generateUserJwtToken(user);
    const refreshToken = await generateUserRefreshToken(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      access_token: accessToken,
      refresh_token: refreshToken
    };
  }

  async forgotPassword(contactData) {
    const { contact, contactType } = contactData;
    const { normalizePhone } = require('../helpers/contactHelper');
    const TwilioService = require('../utils/sendSmsUtil');
    
    const normalizedContact = contactType === 'phone' ? normalizePhone(contact) : contact;
    const user = await userRepository.findByEmailOrPhone(normalizedContact);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isVerified) {
      throw new Error('Please verify your email first before resetting password');
    }

    if (!user.isActive) {
      throw new Error('Account is inactive. Please contact admin');
    }

    const otp = generateOTP();
    const expiresAt = createExpiryTime(10);

    await otpRepository.create({
      userId: user.id,
      code: otp,
      type: 'PASSWORD_RESET',
      expiresAt
    });

    // Send password reset OTP via email or SMS
    if (user.email) {
      await sendEmail(
        user.email,
        'Password Reset - OTP',
        emailTemplates.otpEmailTemplate(otp, user.name)
      );
    } else if (user.phone) {
      await TwilioService.sendOTPSMS(user.phone, otp);
    }

    return { message: `Password reset OTP sent to your ${user.email ? 'email' : 'phone'}` };
  }

  async verifyOTP(code) {
    // Find user by OTP code
    console.log('Searching for OTP:', code);
    const validOTP = await otpRepository.findValidOTPByCode(code, 'EMAIL_VERIFICATION');
    console.log('Found OTP:', validOTP);
    if (!validOTP) {
      throw new Error('Invalid or expired OTP');
    }

    const user = await userRepository.findById(validOTP.userId);
    if (!user) {
      throw new Error('User not found');
    }

    await otpRepository.markAsUsed(validOTP.id);
    await userRepository.updateUser(user.id, { isVerified: true });
    
    // Generate tokens after email verification
    const accessToken = await generateUserJwtToken(user);
    const refreshToken = await generateUserRefreshToken(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      access_token: accessToken,
      refresh_token: refreshToken,
      message: 'Email verified successfully'
    };
  }

  async verifyForgetPasswordOTP(code) {
    // Find user by OTP code for password reset
    const validOTP = await otpRepository.findValidOTPByCode(code, 'PASSWORD_RESET');
    if (!validOTP) {
      throw new Error('Invalid or expired OTP');
    }

    const user = await userRepository.findById(validOTP.userId);
    if (!user) {
      throw new Error('User not found');
    }

    await otpRepository.markAsUsed(validOTP.id);

    return {
      message: 'OTP verified successfully. You can now reset your password.',
      verified: true,
      userId: user.id
    };
  }

  async verifyOTPOld(contact, code, type = 'EMAIL_VERIFICATION') {
    const { detectContactType, normalizePhone } = require('../helpers/contactHelper');
    const TwilioService = require('../utils/sendSmsUtil');
    
    const contactType = detectContactType(contact);
    const normalizedContact = contactType === 'phone' ? normalizePhone(contact) : contact;
    const user = await userRepository.findByEmailOrPhone(normalizedContact);
    
    if (!user) {
      throw new Error('User not found');
    }

    // For phone numbers, use Twilio Verify
    if (user.phone) {
      const isValidTwilioOTP = await TwilioService.verifyOTP(user.phone, code);
      if (!isValidTwilioOTP) {
        throw new Error('Invalid or expired OTP');
      }
    } else {
      // For email, use database OTP
      const validOTP = await otpRepository.findValidOTP(user.id, code, type);
      if (!validOTP) {
        throw new Error('Invalid or expired OTP');
      }
      await otpRepository.markAsUsed(validOTP.id);
    }

    if (type === 'EMAIL_VERIFICATION') {
      await userRepository.updateUser(user.id, { isVerified: true });
      
      // Generate tokens after email verification
      const accessToken = await generateUserJwtToken(user);
      const refreshToken = await generateUserRefreshToken(user);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        access_token: accessToken,
        refresh_token: refreshToken,
        message: 'Email verified successfully'
      };
    } else {
      // For PASSWORD_RESET, just confirm OTP is valid
      return {
        message: 'OTP verified successfully. You can now reset your password.',
        verified: true
      };
    }
  }

  async resetPassword(userId, newPassword) {
    const user = await userRepository.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isVerified) {
      throw new Error('Please verify your account first');
    }

    if (!user.isActive) {
      throw new Error('Account is inactive. Please contact admin');
    }

    // Check if user has a recently used PASSWORD_RESET OTP (within last 10 minutes)
    const recentOTP = await otpRepository.findRecentUsedOTP(user.id, 'PASSWORD_RESET');
    if (!recentOTP) {
      throw new Error('Please verify OTP first before resetting password');
    }

    const hashedPassword = await hashPassword(newPassword);
    await userRepository.updatePassword(user.id, hashedPassword);

    return { message: 'Password reset successfully' };
  }

  async socialLogin(socialData) {
    const { firstName, lastName, email, authMethod, socialId, fcmToken } = socialData;
    
    let user = await userRepository.findByEmail(email);
    
    if (user) {
      if (user.authMethod && user.authMethod !== authMethod) {
        throw new Error('Email already linked with another authentication method');
      }
      
      // Update FCM token if provided
      if (fcmToken) {
        await userRepository.updateUser(user.id, { fcmToken });
      }
    } else {
      // Create new user
      user = await userRepository.createUser({
        name: `${firstName} ${lastName}`,
        email,
        authMethod,
        socialId,
        fcmToken,
        isVerified: true // Social login users are auto-verified
      });
    }

    // Update last login
    await userRepository.updateUser(user.id, { lastLoginAt: new Date() });

    const accessToken = await generateUserJwtToken(user);
    const refreshToken = await generateUserRefreshToken(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      access_token: accessToken,
      refresh_token: refreshToken
    };
  }

  async updatePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.password) {
      throw new Error('Cannot update password for social login users');
    }

    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    const hashedNewPassword = await hashPassword(newPassword);
    await userRepository.updatePassword(user.id, hashedNewPassword);

    return { message: 'Password updated successfully' };
  }

  async logout(userId, accessToken) {
    const prisma = require('../config/dbConfig');
    
    // Blacklist the access token
    await prisma.blacklistedToken.create({
      data: {
        token: accessToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
      }
    });

    // Revoke all refresh tokens for the user
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true }
    });

    // Clear FCM token
    await userRepository.updateUser(userId, { fcmToken: null });

    return { message: 'Logged out successfully' };
  }

  async resendOTP(contactData) {
    const { contact, contactType, type = 'EMAIL_VERIFICATION' } = contactData;
    const { normalizePhone } = require('../helpers/contactHelper');
    const TwilioService = require('../utils/sendSmsUtil');
    
    const normalizedContact = contactType === 'phone' ? normalizePhone(contact) : contact;
    const user = await userRepository.findByEmailOrPhone(normalizedContact);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (type === 'EMAIL_VERIFICATION' && user.isVerified) {
      throw new Error('User is already verified');
    }

    const otp = generateOTP();
    const expiresAt = createExpiryTime(10);

    await otpRepository.create({
      userId: user.id,
      code: otp,
      type,
      expiresAt
    });

    // Send OTP via email or SMS
    if (user.email) {
      const subject = type === 'PASSWORD_RESET' ? 'Password Reset - OTP' : 'Email Verification - OTP';
      await sendEmail(
        user.email,
        subject,
        emailTemplates.otpEmailTemplate(otp, user.name)
      );
    } else if (user.phone) {
      await TwilioService.sendOTPSMS(user.phone, otp);
    }

    const contactMethod = user.email ? 'email' : 'phone';
    return { message: `OTP resent to your ${contactMethod}` };
  }
}

module.exports = new AuthService();
