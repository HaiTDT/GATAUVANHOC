import { prisma } from './src/lib/prisma';

const newCategories = [
  { name: 'Toner / Nước hoa hồng', slug: 'toner-nuoc-hoa-hong' },
  { name: 'Serum / Tinh chất đặc trị', slug: 'serum-tinh-chat' },
  { name: 'Kem dưỡng ẩm', slug: 'kem-duong-am' },
  { name: 'Phấn má hồng', slug: 'phan-ma-hong' },
  { name: 'Kem ủ tóc / Phục hồi tóc', slug: 'kem-u-toc' },
  { name: 'Lăn / Xịt khử mùi', slug: 'lan-xit-khu-mui' },
  { name: 'Tẩy tế bào chết toàn thân', slug: 'tay-te-bao-chet' },
  { name: 'Xịt thơm body (Body Mist)', slug: 'xit-thom-body' },
  { name: 'Collagen làm đẹp da', slug: 'collagen' },
  { name: 'Vitamin & Viên uống hỗ trợ', slug: 'vitamin-vien-uong' }
];

async function addCategories() {
  for (const cat of newCategories) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!existing) {
      await prisma.category.create({ data: cat });
      console.log(`Created category: ${cat.name}`);
    } else {
      console.log(`Category already exists: ${cat.name}`);
    }
  }
}

addCategories()
  .then(() => console.log('Done'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
