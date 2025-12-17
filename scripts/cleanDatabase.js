const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DatabaseCleaner {
  // Clean all data but keep schema
  async cleanAllData() {
    console.log('🧹 Cleaning all data...');
    
    await prisma.orderItemAddOn.deleteMany();
    await prisma.orderItemOption.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.addOn.deleteMany();
    await prisma.categoryOption.deleteMany();
    await prisma.item.deleteMany();
    await prisma.category.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.blacklistedToken.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.otpCode.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('✅ All data cleaned');
  }

  // Clean only transactional data (keep users, categories, items)
  async cleanTransactionalData() {
    console.log('🧹 Cleaning transactional data...');
    
    await prisma.orderItemAddOn.deleteMany();
    await prisma.orderItemOption.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.blacklistedToken.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.otpCode.deleteMany();
    
    console.log('✅ Transactional data cleaned');
  }

  // Clean only user-related data
  async cleanUserData() {
    console.log('🧹 Cleaning user data...');
    
    await prisma.orderItemAddOn.deleteMany();
    await prisma.orderItemOption.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.blacklistedToken.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.otpCode.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('✅ User data cleaned');
  }

  // Clean expired tokens and OTPs
  async cleanExpiredData() {
    console.log('🧹 Cleaning expired data...');
    
    const now = new Date();
    
    await prisma.blacklistedToken.deleteMany({
      where: { expiresAt: { lt: now } }
    });
    
    await prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: now } }
    });
    
    await prisma.otpCode.deleteMany({
      where: { expiresAt: { lt: now } }
    });
    
    console.log('✅ Expired data cleaned');
  }

  // Reset database and run seed
  async resetWithSeed() {
    console.log('🧹 Resetting database with seed data...');
    
    await this.cleanAllData();
    
    // Run seed
    const { exec } = require('child_process');
    exec('npx prisma db seed', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Seed failed:', error);
        return;
      }
      console.log('✅ Database reset with seed data');
    });
  }
}

// CLI interface
async function main() {
  const cleaner = new DatabaseCleaner();
  const args = process.argv.slice(2);
  const action = args[0];

  try {
    switch (action) {
      case 'all':
        await cleaner.cleanAllData();
        break;
      case 'transactional':
        await cleaner.cleanTransactionalData();
        break;
      case 'users':
        await cleaner.cleanUserData();
        break;
      case 'expired':
        await cleaner.cleanExpiredData();
        break;
      case 'reset':
        await cleaner.resetWithSeed();
        break;
      default:
        console.log(`
🧹 Database Cleaner

Usage: node scripts/cleanDatabase.js [action]

Actions:
  all           - Clean all data (keep schema)
  transactional - Clean orders, carts, tokens (keep users, items)
  users         - Clean all user-related data
  expired       - Clean expired tokens and OTPs only
  reset         - Clean all data and run seed

Examples:
  node scripts/cleanDatabase.js all
  node scripts/cleanDatabase.js expired
        `);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = DatabaseCleaner;