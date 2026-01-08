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
      stock: 50,
      images: {
        create: [
          {
            imageUrl: 'http://192.168.18.141:5000/uploads/items/item-1765966006319-278903461.jpg',
            isPrimary: true,
            order: 0
          }
        ]
      }
    }
  });

  // Create Add-ons
  await prisma.addOn.create({
    data: {
      name: 'Caramel Drizzle',
      price: 30,
      isActive: true
    }
  });

  await prisma.addOn.create({
    data: {
      name: 'Pearls',
      price: 25,
      isActive: true
    }
  });


  // Create Coffee Category Options
  await prisma.categoryOption.create({
    data: {
      categoryId: coffeeCategory.id,
      optionType: 'SIZE',
      name: 'Regular',
      extraPrice: 0
    }
  });

  await prisma.categoryOption.create({
    data: {
      categoryId: coffeeCategory.id,
      optionType: 'SIZE',
      name: 'Special',
      extraPrice: 50
    }
  });

  await prisma.categoryOption.create({
    data: {
      categoryId: coffeeCategory.id,
      optionType: 'ICE_LEVEL',
      name: 'Normal',
      extraPrice: 0
    }
  });

  await prisma.categoryOption.create({
    data: {
      categoryId: coffeeCategory.id,
      optionType: 'ICE_LEVEL',
      name: 'Less',
      extraPrice: 0
    }
  });

  await prisma.categoryOption.create({
    data: {
      categoryId: coffeeCategory.id,
      optionType: 'ICE_LEVEL',
      name: 'Extra',
      extraPrice: 0
    }
  });

  await prisma.categoryOption.create({
    data: {
      categoryId: coffeeCategory.id,
      optionType: 'SUGAR_LEVEL',
      name: 'Normal',
      extraPrice: 0
    }
  });

  await prisma.categoryOption.create({
    data: {
      categoryId: coffeeCategory.id,
      optionType: 'SUGAR_LEVEL',
      name: 'Less',
      extraPrice: 0
    }
  });

  await prisma.categoryOption.create({
    data: {
      categoryId: coffeeCategory.id,
      optionType: 'SUGAR_LEVEL',
      name: 'No',
      extraPrice: 0
    }
  });

  // Create Bakery Category Options
  await prisma.categoryOption.create({
    data: {
      categoryId: bakeryCategory.id,
      optionType: 'SIZE',
      name: 'Regular',
      extraPrice: 0
    }
  });

  await prisma.categoryOption.create({
    data: {
      categoryId: bakeryCategory.id,
      optionType: 'SIZE',
      name: 'Large',
      extraPrice: 30
    }
  });

  // Create Beverages Category Options
  await prisma.categoryOption.create({
    data: {
      categoryId: beveragesCategory.id,
      optionType: 'SIZE',
      name: 'Regular',
      extraPrice: 0
    }
  });

  await prisma.categoryOption.create({
    data: {
      categoryId: beveragesCategory.id,
      optionType: 'SIZE',
      name: 'Large',
      extraPrice: 40
    }
  });

  await prisma.categoryOption.create({
    data: {
      categoryId: beveragesCategory.id,
      optionType: 'ICE_LEVEL',
      name: 'Normal',
      extraPrice: 0
    }
  });

  await prisma.categoryOption.create({
    data: {
      categoryId: beveragesCategory.id,
      optionType: 'ICE_LEVEL',
      name: 'Less',
      extraPrice: 0
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