import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const GROUP_SLUGS: Record<string, string[]> = {
    'cham-soc-da':     ['kem-chong-nang', 'mat-na', 'sua-rua-mat', 'tay-trang-mat'],
    'trang-diem':      ['trang-diem-moi', 'trang-diem-mat', 'trang-diem-vung-mat'],
    'cham-soc-co-the': ['dau-goi-va-dau-xa', 'sua-tam', 'duong-the', 'cham-soc-rang-mieng', 'dau-xit-duong-toc'],
    'clinic':          ['nuoc-hoa', 'khac'],
};

async function main() {
    const categories = await prisma.category.findMany();
    const catBySlug = Object.fromEntries(categories.map(c => [c.slug, c.id]));

    for (const [group, slugs] of Object.entries(GROUP_SLUGS)) {
        const ids = slugs.map(s => catBySlug[s]).filter(Boolean);
        const products = await prisma.product.findMany({
            where: { categoryId: { in: ids }, brand: { not: null } },
            select: { brand: true }
        });
        const brandCount: Record<string, number> = {};
        for (const p of products) {
            if (p.brand) brandCount[p.brand] = (brandCount[p.brand] || 0) + 1;
        }
        const top4 = Object.entries(brandCount).sort((a, b) => b[1] - a[1]).slice(0, 4).map(e => e[0]);
        console.log(`${group}: ${JSON.stringify(top4)}`);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
