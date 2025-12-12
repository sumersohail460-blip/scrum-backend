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
      
      // Set new image filename
      updateFields.image = imageFile.filename;
    }

    // Update user in database
    const updatedUser = await userRepository.updateUser(userId, updateFields);

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      image: updatedUser.image,
      message: 'Profile updated successfully'
    };
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      image: user.image,
      createdAt: user.createdAt
    };
  }
}

module.exports = new UserService();