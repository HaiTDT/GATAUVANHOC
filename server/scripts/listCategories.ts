import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const categories = await prisma.category.findMany();
    console.log(categories.map(x => `${x.id}|${x.name}|${x.slug}`).join('\n'));
}
main().finally(() => prisma.$disconnect());
