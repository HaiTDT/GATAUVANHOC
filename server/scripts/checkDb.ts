import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const productCount = await prisma.product.count();
    console.log(`Total products: ${productCount}`);

    const categoryCount = await prisma.category.count();
    console.log(`Total categories: ${categoryCount}`);

    const categories = await prisma.category.findMany({
        include: { _count: { select: { products: true } } },
        orderBy: { name: 'asc' }
    });

    console.log('\n--- Categories ---');
    for (const cat of categories) {
        console.log(`  [${cat.slug}] ${cat.name} => ${cat._count.products} products`);
    }

    if (productCount > 0) {
        const sampleProducts = await prisma.product.findMany({ take: 5, select: { name: true, categoryId: true } });
        console.log('\n--- Sample Products ---');
        for (const p of sampleProducts) {
            console.log(`  ${p.name} (catId: ${p.categoryId})`);
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
