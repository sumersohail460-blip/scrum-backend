const userRepository = require('../repositories/userRepository');
const path = require('path');
const fs = require('fs');

class UserService {
  async updateProfile(userId, updateData, imageFile) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updateFields = {};
    
    // Update name if provided
    if (updateData.name) {
      updateFields.name = updateData.name;
    }

    // Handle image upload
    if (imageFile) {
      updateFields.image = imageFile.path; // Cloudinary URL
    }

    // Update user in database
    const updatedUser = await userRepository.updateUser(userId, updateFields);

    // Generate full image URL
    const imageUrl = updatedUser.image || null;

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      image_url: imageUrl,
      message: 'Profile updated successfully'
    };
  }

  async getProfile(userId) {
    const loyaltyCardRepository = require('../repositories/loyaltyCardRepository');
    
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has loyalty card
    const loyaltyCard = await loyaltyCardRepository.findByUserId(userId);

    // Generate full image URL
    const imageUrl = user.image || null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      image_url: imageUrl,
      createdAt: user.createdAt,
      hasLoyaltyCard: !!loyaltyCard
    };
  }

  async deleteUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Delete user image if exists
    if (user.image) {
      const imagePath = path.join(__dirname, '../../uploads/images', user.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete user from database
    await userRepository.deleteUser(userId);

    return { message: 'User deleted successfully' };
  }

  async getAllUsers() {
    const users = await userRepository.findMany({});
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      image_url: user.image || null,
      isVerified: user.isVerified,
      isActive: user.isActive,
      authMethod: user.authMethod,
      createdAt: user.createdAt
    }));
  }

  async updateSettings(userId, settingsData) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updateFields = {};
    
    if (typeof settingsData.pushNotifications === 'boolean') {
      updateFields.pushNotifications = settingsData.pushNotifications;
    }
    
    if (typeof settingsData.emailNotifications === 'boolean') {
      updateFields.emailNotifications = settingsData.emailNotifications;
    }
    
    if (typeof settingsData.marketingCommunications === 'boolean') {
      updateFields.marketingCommunications = settingsData.marketingCommunications;
    }

    const updatedUser = await userRepository.updateUser(userId, updateFields);

    return {
      pushNotifications: updatedUser.pushNotifications,
      emailNotifications: updatedUser.emailNotifications,
      marketingCommunications: updatedUser.marketingCommunications,
      message: 'Settings updated successfully'
    };
  }

  async getSettings(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      pushNotifications: user.pushNotifications,
      emailNotifications: user.emailNotifications,
      marketingCommunications: user.marketingCommunications
    };
  }
}

module.exports = new UserService();