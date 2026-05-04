import { PrismaClient, OrderStatus, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Bắt đầu tạo dữ liệu mẫu cho Analytics & RFM...");

  // 1. Tạo một số khách hàng mẫu
  const passwordHash = await bcrypt.hash("123456", 10);
  
  const customers = [
    { email: "champion.user@gmail.com", fullName: "Nguyễn Văn VIP", phone: "0901111111" },
    { email: "loyal.user@gmail.com", fullName: "Trần Thị Trung Thành", phone: "0902222222" },
    { email: "atrisk.user@gmail.com", fullName: "Lê Văn Nguy Cơ", phone: "0903333333" },
    { email: "new.user@gmail.com", fullName: "Phạm Văn Mới", phone: "0904444444" },
    { email: "lost.user@gmail.com", fullName: "Hoàng Thị Mất Tích", phone: "0905555555" },
    { email: "potential.user@gmail.com", fullName: "Đặng Văn Tiềm Năng", phone: "0906666666" },
    { email: "hibernating.user@gmail.com", fullName: "Bùi Văn Ngủ Đông", phone: "0907777777" },
    { email: "user.test1@gmail.com", fullName: "Khách lẻ 1", phone: "0908888881" },
    { email: "user.test2@gmail.com", fullName: "Khách lẻ 2", phone: "0908888882" },
    { email: "user.test3@gmail.com", fullName: "Khách lẻ 3", phone: "0908888883" },
  ];

  console.log("Creating customers...");
  for (const c of customers) {
    await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        ...c,
        passwordHash,
        role: Role.CUSTOMER,
      },
    });
  }

  const dbCustomers = await prisma.user.findMany({
    where: { email: { in: customers.map(c => c.email) } }
  });

  // 2. Lấy danh sách sản phẩm thực tế
  const products = await prisma.product.findMany({ take: 50 });
  if (products.length === 0) {
    console.error("❌ Lỗi: Không tìm thấy sản phẩm nào trong DB để tạo đơn hàng.");
    return;
  }

  const now = new Date();

  // Helper để tạo ngày ngẫu nhiên
  const daysAgo = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d;
  };

  const createOrder = async (user: any, days: number, itemCounts: number, status: OrderStatus = OrderStatus.COMPLETED) => {
    const orderDate = daysAgo(days);
    const orderItems = [];
    let total = 0;

    for (let i = 0; i < itemCounts; i++) {
      const p = products[Math.floor(Math.random() * products.length)];
      const qty = Math.floor(Math.random() * 2) + 1;
      const price = Number(p.price);
      total += price * qty;
      orderItems.push({
        productId: p.id,
        quantity: qty,
        unitPrice: p.price
      });
    }

    return await prisma.order.create({
      data: {
        userId: user.id,
        status: status,
        totalAmount: total,
        shippingName: user.fullName || "Sample Name",
        shippingPhone: user.phone || "0900000000",
        shippingAddress: "123 Đường mẫu, Quận 1, TP.HCM",
        createdAt: orderDate,
        updatedAt: orderDate,
        items: {
          create: orderItems
        }
      }
    });
  };

  console.log("Generating orders for RFM simulation...");

  // CHAMPION: Mua gần đây, mua rất nhiều lần, chi nhiều tiền
  const champion = dbCustomers.find(u => u.email.includes("champion"))!;
  await createOrder(champion, 2, 3);
  await createOrder(champion, 10, 2);
  await createOrder(champion, 25, 4);
  await createOrder(champion, 45, 1);
  await createOrder(champion, 60, 5);

  // LOYAL: Mua thường xuyên nhưng không quá gần
  const loyal = dbCustomers.find(u => u.email.includes("loyal"))!;
  await createOrder(loyal, 15, 2);
  await createOrder(loyal, 35, 2);
  await createOrder(loyal, 55, 3);
  await createOrder(loyal, 80, 2);

  // AT RISK: Trước mua nhiều, dạo này không mua (3-4 tháng trước)
  const atRisk = dbCustomers.find(u => u.email.includes("atrisk"))!;
  await createOrder(atRisk, 70, 4);
  await createOrder(atRisk, 95, 3);
  await createOrder(atRisk, 120, 2);

  // NEW: Vừa mua 1 đơn duy nhất
  const newUser = dbCustomers.find(u => u.email.includes("new"))!;
  await createOrder(newUser, 1, 2);

  // HIBERNATING: Mua ít, lâu rồi chưa quay lại
  const hiber = dbCustomers.find(u => u.email.includes("hibernating"))!;
  await createOrder(hiber, 110, 1);
  await createOrder(hiber, 150, 1);

  // LOST: Chỉ mua 1 lần cách đây 1 năm
  const lost = dbCustomers.find(u => u.email.includes("lost"))!;
  await createOrder(lost, 360, 1);

  // POTENTIAL: Mua gần đây 1-2 lần
  const potential = dbCustomers.find(u => u.email.includes("potential"))!;
  await createOrder(potential, 5, 2);
  await createOrder(potential, 20, 1);

  // Random orders for general trend (7 days trend)
  console.log("Generating random orders for revenue trend...");
  for (let i = 0; i < 30; i++) {
    const randomUser = dbCustomers[Math.floor(Math.random() * dbCustomers.length)];
    const day = Math.floor(Math.random() * 30); // Trong 30 ngày qua
    await createOrder(randomUser, day, Math.floor(Math.random() * 3) + 1);
  }

  // Một số đơn bị hủy hoặc đang chờ
  for (let i = 0; i < 5; i++) {
    const randomUser = dbCustomers[Math.floor(Math.random() * dbCustomers.length)];
    await createOrder(randomUser, 2, 1, OrderStatus.CANCELLED);
    await createOrder(randomUser, 1, 1, OrderStatus.PENDING);
  }

  console.log("✅ Hoàn thành seed dữ liệu mẫu!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
