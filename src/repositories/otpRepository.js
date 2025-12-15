const prisma = require('../config/dbConfig');

class OtpRepository {
  async create(otpData) {
    return await prisma.otpCode.create({ data: otpData });
  }

  async findValidOTP(userId, code, type) {
    return await prisma.otpCode.findFirst({
      where: {
        userId,
        code,
        type,
        isUsed: false,
        expiresAt: { gt: new Date() }
      }
    });
  }

  async findValidOTPByCode(code, type) {
    return await prisma.otpCode.findFirst({
      where: {
        code,
        type,
        isUsed: false,
        expiresAt: { gt: new Date() }
      }
    });
  }

  async markAsUsed(id) {
    return await prisma.otpCode.update({
      where: { id },
      data: { isUsed: true }
    });
  }

  async deleteExpiredOTPs() {
    return await prisma.otpCode.deleteMany({
      where: { expiresAt: { lt: new Date() } }
    });
  }

  async findRecentUsedOTP(userId, type) {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    return await prisma.otpCode.findFirst({
      where: {
        userId,
        type,
        isUsed: true,
        createdAt: { gte: tenMinutesAgo }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

module.exports = new OtpRepository();