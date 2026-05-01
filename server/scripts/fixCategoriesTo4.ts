import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categoryMappings = [
    { targetSlug: 'cham-soc-da', targetName: 'Chăm sóc da', matchSlugs: ['kem-chong-nang', 'mat-na', 'sua-rua-mat', 'tay-trang-mat', 'cham-soc-da'] },
    { targetSlug: 'trang-diem', targetName: 'Trang điểm', matchSlugs: ['trang-diem-moi', 'trang-diem-mat', 'trang-diem-vung-mat', 'trang-diem'] },
    { targetSlug: 'cham-soc-co-the', targetName: 'Chăm sóc cơ thể', matchSlugs: ['dau-goi-va-dau-xa', 'sua-tam', 'duong-the', 'cham-soc-rang-mieng', 'dau-xit-duong-toc', 'cham-soc-co-the'] },
    { targetSlug: 'clinic', targetName: 'Clinic', matchSlugs: ['nuoc-hoa', 'khac', 'clinic'] }
];

function getTargetCategoryInfo(oldSlug: string) {
    for (const mapping of categoryMappings) {
        for (const match of mapping.matchSlugs) {
            if (oldSlug.includes(match)) {
                return mapping;
            }
        }
    }
    return { targetSlug: 'clinic', targetName: 'Clinic' };
}

async function main() {
    console.log('Bắt đầu cập nhật thành 4 danh mục chính...');

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
            cat = await prisma.category.update({
                where: { id: cat.id },
                data: { name: mapping.targetName }
            });
        }
        targetCategories.set(mapping.targetSlug, cat.id);
    }
    
    // 2. Lấy tất cả danh mục hiện tại và update sản phẩm
    const allCategories = await prisma.category.findMany();
    let updatedProductsCount = 0;
    const categoriesToDelete: string[] = [];

    for (const oldCat of allCategories) {
        const targetInfo = getTargetCategoryInfo(oldCat.slug);
        const targetId = targetCategories.get(targetInfo.targetSlug);
        
        if (targetId) {
            if (oldCat.id !== targetId) {
                const res = await prisma.product.updateMany({
                    where: { categoryId: oldCat.id },
                    data: { categoryId: targetId }
                });
                updatedProductsCount += res.count;
                categoriesToDelete.push(oldCat.id);
            }
        }
    }

    console.log(`Đã chuyển ${updatedProductsCount} sản phẩm sang 4 danh mục mới.`);

    // 3. Xóa các danh mục cũ không còn dùng
    if (categoriesToDelete.length > 0) {
        const res = await prisma.category.deleteMany({
            where: { id: { in: categoriesToDelete } }
        });
        console.log(`Đã xóa ${res.count} danh mục dư thừa/cũ.`);
    }

    console.log('Hoàn tất cấu trúc lại thành 4 danh mục!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
