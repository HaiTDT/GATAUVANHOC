import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('=== BƯỚC 1: XÓA DANH MỤC TRỐNG (Vitamin, Collagen, etc.) ===');
    const slugsToDelete = ['vitamin', 'collagen', 'thuc-pham-chuc-nang', 'vitamin-vien-uong', 'vitamin-collagen'];
    
    for (const slug of slugsToDelete) {
        const cat = await prisma.category.findUnique({ 
            where: { slug },
            include: { _count: { select: { products: true } } }
        });
        
        if (cat) {
            if (cat._count.products === 0) {
                await prisma.category.delete({ where: { id: cat.id } });
                console.log(`  [ĐÃ XÓA] ${cat.name} (${slug})`);
            } else {
                console.log(`  [CẢNH BÁO] Danh mục ${cat.name} (${slug}) vẫn còn ${cat._count.products} sản phẩm. Không xóa.`);
            }
        } else {
            console.log(`  [BỎ QUA] Không tìm thấy danh mục ${slug}`);
        }
    }

    console.log('\n=== KIỂM TRA LẠI TẤT CẢ DANH MỤC HIỆN TẠI ===');
    const allCats = await prisma.category.findMany({
        include: { _count: { select: { products: true } } },
        orderBy: { name: 'asc' }
    });

    for (const cat of allCats) {
        console.log(`- [${cat.slug}] ${cat.name}: ${cat._count.products} sản phẩm`);
    }

    const totalProducts = await prisma.product.count();
    console.log(`\nTổng số sản phẩm: ${totalProducts}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
