const userRepository = require('../repositories/userRepository');
const otpRepository = require('../repositories/otpRepository');
const { generateUserJwtToken, generateUserRefreshToken, hashPassword, comparePassword } = require('../helpers/authHelper');
const { generateOTP, createExpiryTime } = require('../utils/otpUtil');
const { badResponse } = require('../utils/apiResponseUtil');
const sendEmail = require('../utils/sendMailUtil');
const emailTemplates = require('../emailTemplates');

class AuthService {
  async register(userData) {
    const existingUser = await userRepository.findByEmail(userData.email);
    
    if (existingUser) {
      if (existingUser.isVerified) {
        throw new Error('User already exists with this email');
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

        // Send OTP email
        await sendEmail(
          existingUser.email,
          'Email Verification - OTP',
          emailTemplates.otpEmailTemplate(otp, existingUser.name)
        );

        return {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          message: 'OTP resent to your email. Please verify to complete registration.'
        };
      }
    }

    const hashedPassword = await hashPassword(userData.password);
    const user = await userRepository.createUser({
      name: userData.name,
      email: userData.email,
      password: hashedPassword
    });

    // Generate OTP for email verification
    const otp = generateOTP();
    const expiresAt = createExpiryTime(10);

    await otpRepository.create({
      userId: user.id,
      code: otp,
      type: 'EMAIL_VERIFICATION',
      expiresAt
    });

    // Send OTP email
    await sendEmail(
      user.email,
      'Welcome to Scrum - Email Verification',
      emailTemplates.otpEmailTemplate(otp, user.name)
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      message: 'Registration successful. Please check your email for OTP verification.'
    };
  }

  async loginUser(userData) {
    const { email, password } = userData;
    const user = await userRepository.findByEmail(email);
    
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

  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
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

    // Send password reset OTP email
    await sendEmail(
      user.email,
      'Password Reset - OTP',
      emailTemplates.otpEmailTemplate(otp, user.name)
    );

    return { message: 'Password reset OTP sent to your email' };
  }

  async verifyOTP(email, code, type = 'EMAIL_VERIFICATION') {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const validOTP = await otpRepository.findValidOTP(user.id, code, type);
    if (!validOTP) {
      throw new Error('Invalid or expired OTP');
    }

    await otpRepository.markAsUsed(validOTP.id);

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

  async resetPassword(email, newPassword) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isVerified) {
      throw new Error('Please verify your email first');
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
}

module.exports = new AuthService();
