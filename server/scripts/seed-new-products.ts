
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1. Lấy hoặc tạo Users mẫu
  let users = await prisma.user.findMany({ take: 3 });
  if (users.length < 3) {
    console.log('Creating sample users...');
    const newUsers = [
      { email: 'user1@example.com', fullName: 'Nguyễn Văn A', passwordHash: 'hashed' },
      { email: 'user2@example.com', fullName: 'Trần Thị B', passwordHash: 'hashed' },
      { email: 'user3@example.com', fullName: 'Lê Văn C', passwordHash: 'hashed' },
    ];
    for (const u of newUsers) {
      const user = await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: u,
      });
      console.log(`User created/found: ${user.email}`);
    }
    users = await prisma.user.findMany({ take: 3 });
  }

  // 2. Lấy một category mẫu (ví dụ: Son Kem)
  const category = await prisma.category.findFirst({
    where: { slug: 'son-kem' }
  });

  if (!category) {
    console.error('Category "son-kem" not found. Please run migrateCategories.ts first.');
    return;
  }

  // 3. Tạo sản phẩm mới
  const newProducts = [
    {
      name: 'Son Kem Lì Black Rouge Air Fit Velvet Tint - Ver 8',
      slug: 'son-kem-li-black-rouge-ver-8',
      price: 155000,
      description: 'Dòng son kem lì nổi tiếng của Black Rouge với bảng màu đa dạng và chất son mịn mượt.',
      brand: 'Black Rouge',
      stock: 100,
      categoryId: category.id,
      imageUrl: 'https://hasaki.vn/vnt_upload/product/2021_11/son-kem-black-rouge-a12.jpg'
    },
    {
      name: 'Son Kem Merzy The First Velvet Tint Limited Edition',
      slug: 'son-kem-merzy-limited',
      price: 145000,
      description: 'Phiên bản giới hạn với tông màu đỏ gạch cực trend và độ bám màu cực tốt.',
      brand: 'Merzy',
      stock: 50,
      categoryId: category.id,
      imageUrl: 'https://hasaki.vn/vnt_upload/product/2020_10/son-kem-merzy-v6.jpg'
    }
  ];

  for (const p of newProducts) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
    console.log(`Product created/found: ${product.name}`);

    // 4. Thêm 2-3 review cho mỗi sản phẩm
    const reviewData = [
      { rating: 5, comment: 'Sản phẩm dùng rất thích, màu đẹp đúng như mô tả!', userId: users[0].id },
      { rating: 4, comment: 'Chất son mịn, nhưng hơi nhanh trôi một chút.', userId: users[1].id },
      { rating: 5, comment: 'Giao hàng nhanh, đóng gói cẩn thận. Rất đáng tiền.', userId: users[2].id },
    ];

    for (const r of reviewData) {
      await prisma.review.upsert({
        where: {
          userId_productId: {
            userId: r.userId,
            productId: product.id
          }
        },
        update: {},
        create: {
          ...r,
          productId: product.id
        }
      });
    }
    console.log(`Added ${reviewData.length} reviews for ${product.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
