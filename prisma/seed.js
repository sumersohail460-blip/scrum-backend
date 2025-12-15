const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create categories
  const coffeeCategory = await prisma.category.create({
    data: { name: 'Coffee' }
  });

  const bakeryCategory = await prisma.category.create({
    data: { name: 'Bakery' }
  });

  const beveragesCategory = await prisma.category.create({
    data: { name: 'Beverages' }
  });

  const breakfastCategory = await prisma.category.create({
    data: { name: 'Breakfast' }
  });

  // Create item
  await prisma.item.create({
    data: {
      categoryId: coffeeCategory.id,
      name: 'Caramel Creme',
      detail: 'Bitter smooth perfect coffee',
      currentPrice: 700,
      previousPrice: 900,
      rating: 4.5,
      stock: 50
    }
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });