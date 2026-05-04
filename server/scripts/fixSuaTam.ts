import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('=== FIX: Gom danh mục sữa tắm bị sót ===');

    // Tìm danh mục đích "sua-tam"
    let suaTam = await prisma.category.findUnique({ where: { slug: 'sua-tam' } });
    if (!suaTam) {
        suaTam = await prisma.category.create({
            data: { name: 'Sữa Tắm', slug: 'sua-tam', description: 'Danh mục Sữa Tắm' }
        });
    }

    // Gom tất cả danh mục có slug chứa "sua-tam-xa-bong-tam"
    const fragmentedCats = await prisma.category.findMany({
        where: { slug: { contains: 'sua-tam-xa-bong-tam' } }
    });

    let moved = 0;
    for (const cat of fragmentedCats) {
        const res = await prisma.product.updateMany({
            where: { categoryId: cat.id },
            data: { categoryId: suaTam.id }
        });
        moved += res.count;
        console.log(`  [GOM] ${cat.slug} → sua-tam: ${res.count} SP`);

        // Xóa danh mục rỗng
        const remaining = await prisma.product.count({ where: { categoryId: cat.id } });
        if (remaining === 0) {
            await prisma.category.delete({ where: { id: cat.id } });
        }
    }

    console.log(`\nĐã gom ${moved} sản phẩm vào Sữa Tắm.`);

    // Kiểm tra kết quả cuối cùng
    console.log('\n=== KẾT QUẢ CUỐI CÙNG ===');
    const cats = await prisma.category.findMany({
        include: { _count: { select: { products: true } } },
        orderBy: { name: 'asc' }
    });
    for (const cat of cats) {
        console.log(`  [${cat.slug}] ${cat.name}: ${cat._count.products} SP`);
    }
    console.log(`\nTổng sản phẩm: ${await prisma.product.count()}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
