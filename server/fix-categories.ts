import { prisma } from './src/lib/prisma';

const categoryMap: Record<string, string> = {
  'kem-chong-nang': 'Kem chống nắng',
  'mat-na': 'Mặt nạ',
  'sua-rua-mat': 'Sữa rửa mặt',
  'tay-trang-mat': 'Tẩy trang mặt',
  'trang-diem-moi': 'Trang điểm môi',
  'trang-diem-mat': 'Trang điểm mặt',
  'trang-diem-vung-mat': 'Trang điểm vùng mắt',
  'dau-goi-va-dau-xa': 'Dầu gội và Dầu xả',
  'sua-tam': 'Sữa tắm',
  'duong-the': 'Dưỡng thể',
  'cham-soc-rang-mieng': 'Chăm sóc răng miệng',
  'dau-xit-duong-toc': 'Dầu xịt dưỡng tóc',
  'nuoc-hoa': 'Nước hoa'
};

async function fixCategories() {
  const categories = await prisma.category.findMany();
  for (const cat of categories) {
    let newName = cat.name;
    for (const [slugPrefix, properName] of Object.entries(categoryMap)) {
      if (cat.slug.startsWith(slugPrefix)) {
        newName = properName;
        break;
      }
    }
    
    if (newName !== cat.name) {
      await prisma.category.update({
        where: { id: cat.id },
        data: { name: newName }
      });
      console.log(`Updated ${cat.name} -> ${newName}`);
    }
  }
}

fixCategories()
  .then(() => console.log('Done'))
  .finally(() => prisma.$disconnect());
