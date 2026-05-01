import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateSlug(text: string): string {
    return text.toString().toLowerCase()
        .replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
        .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
        .replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
        .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
        .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
        .replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
        .replace(/đ/gi, 'd')
        .replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '')
        .replace(/ /gi, "-")
        .replace(/\-\-\-\-\-/gi, '-')
        .replace(/\-\-\-\-/gi, '-')
        .replace(/\-\-\-/gi, '-')
        .replace(/\-\-/gi, '-')
        .replace(/^\-|\-$/gi, '');
}

function extractCategoryFromUrl(url: string): { name: string, slug: string } {
    if (!url || typeof url !== 'string') {
        return { name: 'Khác', slug: 'khac' };
    }
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    const slugRaw = lastPart.replace(/\.html$/, '').replace(/-c\d+$/, '');
    if (!slugRaw) {
        return { name: 'Khác', slug: 'khac' };
    }
    const name = slugRaw.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    return { name, slug: slugRaw };
}

function parsePrice(priceStr: string): number {
    if (!priceStr) return 0;
    // e.g. "249.000 ₫" -> 249000
    const cleaned = priceStr.replace(/[^\d]/g, '');
    const val = parseInt(cleaned, 10);
    return isNaN(val) ? 0 : val;
}

async function main() {
    const filePath = path.join(__dirname, '../../data/hasaki_products_merged.csv');
    console.log(`Đang đọc file: ${filePath}`);
    
    const products: any[] = [];
    
    // Đọc file CSV
    await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => products.push(data))
            .on('end', () => resolve(true))
            .on('error', (err) => reject(err));
    });
    
    console.log(`Đã đọc ${products.length} sản phẩm. Bắt đầu xử lý...`);
    
    // Có thể mất nhiều thời gian, giới hạn số lượng import nếu cần
    // Thay đổi limit nếu muốn import tất cả, ví dụ: const limit = products.length;
    const limit = products.length; 
    const productsToImport = products.slice(0, limit);
    console.log(`Sẽ import ${productsToImport.length} sản phẩm...`);

    // Lọc danh mục duy nhất
    const categoryMap = new Map<string, { name: string, slug: string }>();
    for (const p of productsToImport) {
        const cat = extractCategoryFromUrl(p['Nguồn']);
        categoryMap.set(cat.slug, cat);
    }
    
    // Lưu các danh mục vào db
    console.log(`Đang tạo/kiểm tra ${categoryMap.size} danh mục...`);
    const categoryIdMap = new Map<string, string>(); // slug -> id
    for (const cat of categoryMap.values()) {
        const existingCat = await prisma.category.findUnique({ where: { slug: cat.slug } });
        if (existingCat) {
            categoryIdMap.set(cat.slug, existingCat.id);
        } else {
            const newCat = await prisma.category.create({
                data: {
                    name: cat.name,
                    slug: cat.slug,
                    description: `Danh mục ${cat.name}`
                }
            });
            categoryIdMap.set(cat.slug, newCat.id);
        }
    }
    
    // Lưu sản phẩm vào db
    console.log('Đang tạo sản phẩm...');
    let successCount = 0;
    for (let i = 0; i < productsToImport.length; i++) {
        const p = productsToImport[i];
        try {
            const nameKey = Object.keys(p).find(k => k.includes('Tên sản phẩm')) || 'Tên sản phẩm';
            const name = p[nameKey]?.trim();
            if (!name) continue;
            
            const baseSlug = generateSlug(name);
            let slug = baseSlug;
            
            // Bỏ qua nếu sản phẩm đã tồn tại
            const existingProduct = await prisma.product.findUnique({ where: { slug } });
            if (existingProduct) {
                continue; // Hoặc bạn có thể thêm logic cập nhật (update) tại đây
            }
            
            const catInfo = extractCategoryFromUrl(p['Nguồn']);
            const categoryId = categoryIdMap.get(catInfo.slug);
            if (!categoryId) continue;
            
            let description = '';
            if (p['Mô tả ngắn']) description += `Mô tả ngắn: ${p['Mô tả ngắn']}\n\n`;
            if (p['Mô tả']) description += `${p['Mô tả']}\n\n`;
            if (p['Thành phần']) description += `Thành phần: ${p['Thành phần']}\n\n`;
            if (p['HDSD']) description += `Hướng dẫn sử dụng: ${p['HDSD']}`;
            
            // Xóa UTF-8 BOM nếu có trong "Tên sản phẩm"
            const cleanName = name.replace(/^\uFEFF/, '');
            
            await prisma.product.create({
                data: {
                    name: cleanName,
                    slug,
                    description,
                    brand: p['Thương hiệu'],
                    price: parsePrice(p['Giá hiện tại']),
                    imageUrl: p['Ảnh'],
                    stock: 100, // Stock mặc định
                    categoryId
                }
            });
            successCount++;
            if (successCount % 100 === 0) {
                console.log(`Đã import ${successCount} sản phẩm...`);
            }
        } catch (error: any) {
            console.error(`Lỗi import sản phẩm "${p['Tên sản phẩm']}":`, error.message);
        }
    }
    
    console.log(`Hoàn thành! Đã import thành công ${successCount} sản phẩm mới.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
