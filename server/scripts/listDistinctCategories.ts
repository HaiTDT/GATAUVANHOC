import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const categories = await prisma.category.findMany();
    const set = new Set<string>();
    categories.forEach(c => {
        let baseSlug = c.slug.split('.html')[0];
        set.add(baseSlug);
    });
    console.log(Array.from(set).join('\n'));
}
main().finally(() => prisma.$disconnect());
