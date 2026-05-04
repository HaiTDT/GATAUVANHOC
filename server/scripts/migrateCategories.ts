import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ====================================================================
// BƯỚC 1: Gom các danh mục bị phân mảnh (do scraping) về danh mục gốc
// Ví dụ: "trang-diem-moi-c24.html?p=5" → "trang-diem-moi"
// ====================================================================
const BASE_CATEGORIES = [
    { slug: 'kem-chong-nang', name: 'Chống Nắng Da Mặt', matchPrefix: 'chong-nang-da-mat' },
    { slug: 'trang-diem-moi', name: 'Trang Điểm Môi', matchPrefix: 'trang-diem-moi' },
    { slug: 'mat-na', name: 'Mặt Nạ', matchPrefix: 'mat-na' },
    { slug: 'trang-diem-mat', name: 'Trang Điểm Mặt', matchPrefix: 'trang-diem-mat' },
    { slug: 'sua-rua-mat', name: 'Sữa Rửa Mặt', matchPrefix: 'sua-rua-mat' },
    { slug: 'trang-diem-vung-mat', name: 'Trang Điểm Vùng Mắt', matchPrefix: 'trang-diem-vung-mat' },
    { slug: 'dau-goi-va-dau-xa', name: 'Dầu Gội & Dầu Xả', matchPrefix: 'dau-goi-va-dau-xa' },
    { slug: 'tay-trang-mat', name: 'Tẩy Trang Mặt', matchPrefix: 'tay-trang-mat' },
    { slug: 'sua-tam', name: 'Sữa Tắm', matchPrefix: 'sua-tam' },
    { slug: 'duong-the', name: 'Dưỡng Thể', matchPrefix: 'duong-the' },
    { slug: 'nuoc-hoa', name: 'Nước Hoa', matchPrefix: 'nuoc-hoa' },
    { slug: 'cham-soc-rang-mieng', name: 'Chăm Sóc Răng Miệng', matchPrefix: 'cham-soc-rang-mieng' },
    { slug: 'dau-xit-duong-toc', name: 'Dầu Xịt Dưỡng Tóc', matchPrefix: 'dau-xit-duong-toc' },
];

// ====================================================================
// BƯỚC 2: Tách các danh mục lớn thành danh mục con dựa trên tên SP
// ====================================================================
const SUB_CATEGORY_RULES: {
    parentSlug: string;
    newSlug: string;
    newName: string;
    keywords: string[];
}[] = [
    // --- Từ "Trang điểm môi" ---
    { parentSlug: 'trang-diem-moi', newSlug: 'son-kem', newName: 'Son Kem', keywords: ['son kem'] },
    { parentSlug: 'trang-diem-moi', newSlug: 'son-duong', newName: 'Son Dưỡng', keywords: ['son dưỡng', 'lip balm', 'dưỡng môi'] },
    { parentSlug: 'trang-diem-moi', newSlug: 'son-tint-son-bong', newName: 'Son Tint / Son Bóng', keywords: ['tint', 'son bóng', 'lip gloss', 'son nước'] },

    // --- Từ "Trang điểm mặt" ---
    { parentSlug: 'trang-diem-mat', newSlug: 'kem-nen', newName: 'Kem Nền', keywords: ['kem nền', 'foundation'] },
    { parentSlug: 'trang-diem-mat', newSlug: 'phan-nuoc-cushion', newName: 'Phấn Nước (Cushion)', keywords: ['phấn nước', 'cushion'] },
    { parentSlug: 'trang-diem-mat', newSlug: 'ma-hong', newName: 'Má Hồng', keywords: ['má hồng', 'blush'] },
    { parentSlug: 'trang-diem-mat', newSlug: 'kem-che-khuyet-diem', newName: 'Kem Che Khuyết Điểm', keywords: ['che khuyết điểm', 'concealer'] },

    // --- Từ "Tẩy trang mặt" ---
    { parentSlug: 'tay-trang-mat', newSlug: 'nuoc-tay-trang', newName: 'Nước Tẩy Trang', keywords: ['nước tẩy trang', 'micellar'] },
    { parentSlug: 'tay-trang-mat', newSlug: 'dau-sap-tay-trang', newName: 'Dầu / Sáp Tẩy Trang', keywords: ['dầu tẩy trang', 'sáp tẩy trang', 'cleansing oil', 'cleansing balm'] },

    // --- Từ "Nước hoa" ---
    { parentSlug: 'nuoc-hoa', newSlug: 'xit-thom-toan-than', newName: 'Xịt Thơm Toàn Thân', keywords: ['xịt thơm', 'body mist'] },
];

function findBaseCategory(oldSlug: string): typeof BASE_CATEGORIES[0] | null {
    for (const base of BASE_CATEGORIES) {
        if (oldSlug === base.slug || oldSlug === base.matchPrefix || oldSlug.startsWith(base.matchPrefix + '-c') || oldSlug.startsWith(base.slug + '-c')) {
            return base;
        }
    }
    return null;
}

function findSubCategory(productName: string, parentSlug: string): typeof SUB_CATEGORY_RULES[0] | null {
    const nameLower = productName.toLowerCase();
    for (const rule of SUB_CATEGORY_RULES) {
        if (rule.parentSlug !== parentSlug) continue;
        for (const kw of rule.keywords) {
            if (nameLower.includes(kw)) {
                return rule;
            }
        }
    }
    return null;
}

async function main() {
    console.log('=== BẮT ĐẦU MIGRATE DANH MỤC ===\n');

    // ---- BƯỚC 1: Gom danh mục phân mảnh ----
    console.log('--- Bước 1: Gom danh mục phân mảnh ---');

    // Đảm bảo 13 danh mục gốc tồn tại
    const baseCatIds = new Map<string, string>(); // slug → id
    for (const base of BASE_CATEGORIES) {
        let cat = await prisma.category.findUnique({ where: { slug: base.slug } });
        if (!cat) {
            cat = await prisma.category.create({
                data: { name: base.name, slug: base.slug, description: `Danh mục ${base.name}` }
            });
            console.log(`  [TẠO MỚI] ${base.name} (${base.slug})`);
        }
        baseCatIds.set(base.slug, cat.id);
    }

    // Lấy tất cả danh mục hiện tại
    const allCategories = await prisma.category.findMany();
    let mergedCount = 0;
    const catsToDelete: string[] = [];

    for (const oldCat of allCategories) {
        const base = findBaseCategory(oldCat.slug);
        if (!base) continue; // Không match thì bỏ qua

        const baseId = baseCatIds.get(base.slug)!;
        if (oldCat.id === baseId) continue; // Đã là danh mục gốc rồi

        // Chuyển sản phẩm từ danh mục phân mảnh sang danh mục gốc
        const res = await prisma.product.updateMany({
            where: { categoryId: oldCat.id },
            data: { categoryId: baseId }
        });
        if (res.count > 0) {
            console.log(`  [GOM] ${oldCat.slug} → ${base.slug}: ${res.count} sản phẩm`);
            mergedCount += res.count;
        }
        catsToDelete.push(oldCat.id);
    }

    // Xóa danh mục phân mảnh (chỉ xóa nếu đã không còn sản phẩm)
    let deletedCount = 0;
    for (const catId of catsToDelete) {
        const remaining = await prisma.product.count({ where: { categoryId: catId } });
        if (remaining === 0) {
            await prisma.category.delete({ where: { id: catId } });
            deletedCount++;
        } else {
            console.log(`  [SKIP DELETE] Danh mục ${catId} vẫn còn ${remaining} sản phẩm`);
        }
    }
    if (deletedCount > 0) {
        console.log(`  Đã xóa ${deletedCount} danh mục phân mảnh.`);
    }
    console.log(`  Tổng cộng đã gom: ${mergedCount} sản phẩm.\n`);

    // ---- BƯỚC 2: Tạo danh mục con & phân loại dựa trên tên SP ----
    console.log('--- Bước 2: Tách danh mục con ---');

    // Tạo các danh mục con
    const subCatIds = new Map<string, string>(); // slug → id
    for (const rule of SUB_CATEGORY_RULES) {
        let cat = await prisma.category.findUnique({ where: { slug: rule.newSlug } });
        if (!cat) {
            cat = await prisma.category.create({
                data: { name: rule.newName, slug: rule.newSlug, description: `Danh mục ${rule.newName}` }
            });
            console.log(`  [TẠO MỚI] ${rule.newName} (${rule.newSlug})`);
        }
        subCatIds.set(rule.newSlug, cat.id);
    }

    // Quét tất cả sản phẩm thuộc các danh mục cha cần tách
    const parentSlugs = [...new Set(SUB_CATEGORY_RULES.map(r => r.parentSlug))];
    let splitCount = 0;

    for (const parentSlug of parentSlugs) {
        const parentId = baseCatIds.get(parentSlug);
        if (!parentId) continue;

        const products = await prisma.product.findMany({
            where: { categoryId: parentId },
            select: { id: true, name: true }
        });

        console.log(`  Đang quét ${products.length} SP trong [${parentSlug}]...`);

        for (const product of products) {
            const subRule = findSubCategory(product.name, parentSlug);
            if (subRule) {
                const subId = subCatIds.get(subRule.newSlug)!;
                await prisma.product.update({
                    where: { id: product.id },
                    data: { categoryId: subId }
                });
                splitCount++;
            }
            // Nếu không match keyword nào → giữ nguyên trong danh mục cha
        }
    }

    console.log(`  Tổng cộng đã tách: ${splitCount} sản phẩm.\n`);

    // ---- KẾT QUẢ CUỐI CÙNG ----
    console.log('=== KẾT QUẢ CUỐI CÙNG ===');
    const finalCategories = await prisma.category.findMany({
        include: { _count: { select: { products: true } } },
        orderBy: { name: 'asc' }
    });
    for (const cat of finalCategories) {
        console.log(`  [${cat.slug}] ${cat.name}: ${cat._count.products} sản phẩm`);
    }
    const totalProducts = await prisma.product.count();
    console.log(`\n  Tổng sản phẩm: ${totalProducts}`);
    console.log('=== HOÀN TẤT ===');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
