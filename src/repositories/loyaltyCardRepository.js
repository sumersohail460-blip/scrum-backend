const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class LoyaltyCardRepository {
  async createLoyaltyCard(data) {
    return await prisma.loyaltyCard.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });
  }

  async findByUserId(userId) {
    return await prisma.loyaltyCard.findFirst({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });
  }

  async findByCardNumber(cardNumber) {
    return await prisma.loyaltyCard.findUnique({
      where: { cardNumber },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });
  }

  async findByBarcode(barcode) {
    return await prisma.loyaltyCard.findUnique({
      where: { barcode },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });
  }

  async updatePoints(cardId, points) {
    return await prisma.loyaltyCard.update({
      where: { id: cardId },
      data: { points }
    });
  }
}

module.exports = new LoyaltyCardRepository();