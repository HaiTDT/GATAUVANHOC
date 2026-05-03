import { prisma } from './src/lib/prisma';

async function getCategories() {
  const categories = await prisma.category.findMany();
  console.log(categories.map(c => ({ id: c.id, name: c.name })));
}
getCategories().finally(() => prisma.$disconnect());
