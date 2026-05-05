
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const sampleComments = [
  'Sản phẩm tuyệt vời, giao hàng nhanh.',
  'Chất lượng tốt, đóng gói cẩn thận.',
  'Dùng rất thích, sẽ mua lại lần sau.',
  'Giá cả hợp lý, nhân viên tư vấn nhiệt tình.',
  'Sản phẩm chính hãng, check mã vạch OK.',
  'Màu đẹp, đúng như hình.',
  'Mùi hương dễ chịu, không gây kích ứng da.',
  'Hàng giao đúng mẫu mã, đủ số lượng.',
  'Tuyệt vời ông mặt trời!',
  'Rất đáng tiền, mọi người nên mua nhé.',
  'Chất lượng vượt mong đợi.',
  'Shop phục vụ rất tốt, 5 sao cho chất lượng.',
  'Giao hàng nhanh như chớp, mới đặt hôm qua hôm nay đã có.',
  'Đóng gói rất chắc chắn, không bị móp méo gì cả.',
  'Sẽ ủng hộ shop dài dài.'
];

async function main() {
  // 1. Lấy hoặc tạo một pool người dùng (khoảng 20 người)
  let users = await prisma.user.findMany({ take: 50 });
  if (users.length < 10) {
    console.log('Creating more sample users for pool...');
    for (let i = 4; i <= 20; i++) {
      await prisma.user.upsert({
        where: { email: `testuser${i}@example.com` },
        update: {},
        create: {
          email: `testuser${i}@example.com`,
          fullName: `Người dùng mẫu ${i}`,
          passwordHash: 'hashed'
        }
      });
    }
    users = await prisma.user.findMany({ take: 50 });
  }

  // 2. Lấy 100 sản phẩm ngẫu nhiên (hoặc 100 sản phẩm đầu tiên)
  const products = await prisma.product.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' }
  });

  console.log(`Adding reviews for ${products.length} products...`);

  let totalAdded = 0;

  for (const product of products) {
    // Số lượng review ngẫu nhiên từ 2-3
    const numReviews = Math.floor(Math.random() * 2) + 2; 
    
    // Chọn ngẫu nhiên users từ pool
    const selectedUsers = users.sort(() => 0.5 - Math.random()).slice(0, numReviews);

    for (const user of selectedUsers) {
      const rating = Math.floor(Math.random() * 2) + 4; // Rating ngẫu nhiên 4 hoặc 5 sao cho đẹp
      const comment = sampleComments[Math.floor(Math.random() * sampleComments.length)];

      try {
        await prisma.review.upsert({
          where: {
            userId_productId: {
              userId: user.id,
              productId: product.id
            }
          },
          update: {
            rating,
            comment
          },
          create: {
            userId: user.id,
            productId: product.id,
            rating,
            comment
          }
        });
        totalAdded++;
      } catch (error) {
        // Có thể trùng lặp nếu user đã review sản phẩm này trước đó, upsert sẽ xử lý
        // console.error(`Error adding review for product ${product.id}:`, error);
      }
    }
  }

  console.log(`Successfully added/updated ${totalAdded} reviews for ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
