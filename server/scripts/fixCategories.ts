import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categoryMappings = [
    { targetSlug: 'kem-chong-nang', targetName: 'Chống Nắng Da Mặt', matchSlugs: ['kem-chong-nang', 'chong-nang-da-mat'] },
    { targetSlug: 'trang-diem-moi', targetName: 'Trang Điểm Môi', matchSlugs: ['trang-diem-moi'] },
    { targetSlug: 'mat-na', targetName: 'Mặt Nạ', matchSlugs: ['mat-na'] },
    { targetSlug: 'trang-diem-mat', targetName: 'Trang Điểm Mặt', matchSlugs: ['trang-diem-mat'] },
    { targetSlug: 'sua-rua-mat', targetName: 'Sữa Rửa Mặt', matchSlugs: ['sua-rua-mat'] },
    { targetSlug: 'trang-diem-vung-mat', targetName: 'Trang Điểm Vùng Mắt', matchSlugs: ['trang-diem-vung-mat'] },
    { targetSlug: 'dau-goi-va-dau-xa', targetName: 'Dầu Gội & Dầu Xả', matchSlugs: ['dau-goi-va-dau-xa'] },
    { targetSlug: 'tay-trang-mat', targetName: 'Tẩy Trang Mặt', matchSlugs: ['tay-trang-mat'] },
    { targetSlug: 'sua-tam', targetName: 'Sữa Tắm', matchSlugs: ['sua-tam'] },
    { targetSlug: 'duong-the', targetName: 'Dưỡng Thể', matchSlugs: ['duong-the'] },
    { targetSlug: 'nuoc-hoa', targetName: 'Nước Hoa', matchSlugs: ['nuoc-hoa'] },
    { targetSlug: 'cham-soc-rang-mieng', targetName: 'Chăm Sóc Răng Miệng', matchSlugs: ['cham-soc-rang-mieng'] },
    { targetSlug: 'dau-xit-duong-toc', targetName: 'Dầu Xịt Dưỡng Tóc', matchSlugs: ['dau-xit-duong-toc'] },
];

function getTargetCategoryInfo(oldSlug: string) {
    for (const mapping of categoryMappings) {
        for (const match of mapping.matchSlugs) {
            if (oldSlug.includes(match)) {
                return mapping;
            }
        }
    }
    return { targetSlug: 'khac', targetName: 'Khác' };
}

async function main() {
    console.log('Bắt đầu cập nhật danh mục...');

    // 1. Tạo các danh mục đích
    const targetCategories = new Map<string, string>(); // slug -> id
    for (const mapping of categoryMappings) {
        let cat = await prisma.category.findUnique({ where: { slug: mapping.targetSlug } });
        if (!cat) {
            cat = await prisma.category.create({
                data: {
                    name: mapping.targetName,
                    slug: mapping.targetSlug,
                    description: `Danh mục ${mapping.targetName}`
                }
            });
        } else {
            // Cập nhật lại tên cho chuẩn
            cat = await prisma.category.update({
                where: { id: cat.id },
                data: { name: mapping.targetName }
            });
        }
        targetCategories.set(mapping.targetSlug, cat.id);
    }
    
    // Thêm danh mục Khác dự phòng
    let khacCat = await prisma.category.findUnique({ where: { slug: 'khac' } });
    if (!khacCat) {
        khacCat = await prisma.category.create({
            data: { name: 'Khác', slug: 'khac', description: 'Danh mục khác' }
        });
    }
    targetCategories.set('khac', khacCat.id);

    // 2. Lấy tất cả danh mục hiện tại và update sản phẩm
    const allCategories = await prisma.category.findMany();
    let updatedProductsCount = 0;
    
    const categoriesToDelete: string[] = [];

    for (const oldCat of allCategories) {
        const targetInfo = getTargetCategoryInfo(oldCat.slug);
        const targetId = targetCategories.get(targetInfo.targetSlug);
        
        if (targetId) {
            // Cập nhật tất cả sản phẩm thuộc oldCat sang targetCat (nếu chúng khác nhau)
            if (oldCat.id !== targetId) {
                const res = await prisma.product.updateMany({
                    where: { categoryId: oldCat.id },
                    data: { categoryId: targetId }
                });
                updatedProductsCount += res.count;
                
                // Đánh dấu để xóa danh mục cũ
                categoriesToDelete.push(oldCat.id);
            }
        }
    }

    console.log(`Đã chuyển ${updatedProductsCount} sản phẩm sang danh mục mới.`);

    // 3. Xóa các danh mục cũ không còn dùng
    if (categoriesToDelete.length > 0) {
        const res = await prisma.category.deleteMany({
            where: { id: { in: categoriesToDelete } }
        });
        console.log(`Đã xóa ${res.count} danh mục dư thừa/cũ.`);
    }

    console.log('Hoàn tất cấu trúc lại danh mục!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
