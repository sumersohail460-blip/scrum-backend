const prisma = require('../config/dbConfig');

class userRepository {
  async findOne(data) {
    return await prisma.user.findFirst({ where: data });
  }

  async findMany(data) {
    return await prisma.user.findMany({ where: data });
  }

  async findByEmail(email) {
    return await prisma.user.findUnique({ where: { email } });
  }

  async findById(id) {
    return await prisma.user.findUnique({ where: { id } });
  }

  async updateUser(id, updateData, session = null) {
    return await prisma.user.update({ where: { id }, data: updateData });
  }

  async deleteUser(userId) {
    try {
      const deletedUser = await prisma.user.delete({
        where: { id: userId }
      });
      return deletedUser;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Find user through email or name
  async findUserByNameOrEmail(name, email) {
    return await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { name: name }]
      }
    });
  }

  async createUser(userData, session = null) {
    return await prisma.user.create({ data: userData });
  }

  async deleteUserById(userId) {
    return await prisma.user.delete({ where: { id: userId } });
  }

  async update(id, updateData, session = null) {
    return await prisma.user.update({ where: { id }, data: updateData });
  }

  async updatePassword(id, password) {
    return await prisma.user.update({
      where: { id },
      data: { password }
    });
  }
}

module.exports = new userRepository();