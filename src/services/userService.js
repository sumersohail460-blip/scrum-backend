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
      // Delete old image if exists
      if (user.image) {
        const oldImagePath = path.join(__dirname, '../../uploads/images', user.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      // Also delete any other images for this user (in case of multiple uploads)
      const imagesDir = path.join(__dirname, '../../uploads/images');
      if (fs.existsSync(imagesDir)) {
        const files = fs.readdirSync(imagesDir);
        files.forEach(file => {
          if (file.startsWith(userId + '_') && file !== imageFile.filename) {
            const filePath = path.join(imagesDir, file);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          }
        });
      }
      
      // Set new image filename
      updateFields.image = imageFile.filename;
    }

    // Update user in database
    const updatedUser = await userRepository.updateUser(userId, updateFields);

    // Generate full image URL
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const imageUrl = updatedUser.image ? `${baseUrl}/uploads/images/${updatedUser.image}` : null;

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
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate full image URL
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const imageUrl = user.image ? `${baseUrl}/uploads/images/${user.image}` : null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      image_url: imageUrl,
      createdAt: user.createdAt
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
      image_url: user.image ? `${baseUrl}/uploads/images/${user.image}` : null,
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