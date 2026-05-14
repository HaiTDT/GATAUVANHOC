import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data for Ga Tàu Văn Học...');

  // 1. Categories
  const catDocHieu = await prisma.category.upsert({
    where: { slug: 'doc-hieu' },
    update: {},
    create: {
      name: 'Đọc hiểu',
      slug: 'doc-hieu',
      description: 'Phần thi đọc hiểu văn bản',
    },
  });

  const catNghiLuanVanHoc = await prisma.category.upsert({
    where: { slug: 'nghi-luan-van-hoc' },
    update: {},
    create: {
      name: 'Nghị luận văn học',
      slug: 'nghi-luan-van-hoc',
      description: 'Phân tích, cảm nhận tác phẩm văn học',
    },
  });

  const catNghiLuanXaHoi = await prisma.category.upsert({
    where: { slug: 'nghi-luan-xa-hoi' },
    update: {},
    create: {
      name: 'Nghị luận xã hội',
      slug: 'nghi-luan-xa-hoi',
      description: 'Nghị luận về một hiện tượng đời sống hoặc tư tưởng đạo lí',
    },
  });

  const catLuyenDe = await prisma.category.upsert({
    where: { slug: 'luyen-de' },
    update: {},
    create: {
      name: 'Luyện đề',
      slug: 'luyen-de',
      description: 'Đề thi thử bám sát cấu trúc đề minh họa',
    },
  });

  // 2. Lessons
  const lesson1 = await prisma.lesson.upsert({
    where: { slug: 'tay-tien-quang-dung' },
    update: {},
    create: {
      title: 'Tây Tiến - Quang Dũng (Phân tích chi tiết)',
      slug: 'tay-tien-quang-dung',
      description: 'Phân tích hình tượng người lính Tây Tiến qua ngòi bút lãng mạn, bi tráng của Quang Dũng.',
      content: '<p>Tây Tiến là một trong những bài thơ xuất sắc nhất của Quang Dũng, khắc họa thành công hình tượng người lính kháng chiến chống Pháp.</p><ul><li>Đoạn 1: Những cuộc hành quân gian khổ và thiên nhiên Tây Bắc hùng vĩ.</li><li>Đoạn 2: Kỉ niệm đêm liên hoan và bức tranh sông nước miền Tây hư ảo.</li><li>Đoạn 3: Chân dung người lính Tây Tiến lãng mạn, bi tráng.</li><li>Đoạn 4: Lời thề gắn bó với Tây Tiến và miền Tây.</li></ul>',
      imageUrl: 'https://images.unsplash.com/photo-1518330722238-abdbfbba5bc8?auto=format&fit=crop&q=80',
      categoryId: catNghiLuanVanHoc.id,
    },
  });

  const lesson2 = await prisma.lesson.upsert({
    where: { slug: 'dat-nuoc-nguyen-khoa-diem' },
    update: {},
    create: {
      title: 'Đất Nước - Nguyễn Khoa Điềm',
      slug: 'dat-nuoc-nguyen-khoa-diem',
      description: 'Tư tưởng Đất Nước của Nhân dân được thể hiện độc đáo qua đoạn trích Đất Nước.',
      content: '<p>Đoạn trích Đất Nước (trích trường ca Mặt đường khát vọng) thể hiện những khám phá, cảm nhận mới mẻ của Nguyễn Khoa Điềm về Đất Nước.</p>',
      imageUrl: 'https://images.unsplash.com/photo-1544640808-32cb4f68eb94?auto=format&fit=crop&q=80',
      categoryId: catNghiLuanVanHoc.id,
    },
  });

  const lesson3 = await prisma.lesson.upsert({
    where: { slug: 'ki-nang-lam-bai-doc-hieu' },
    update: {},
    create: {
      title: 'Kỹ năng làm bài Đọc hiểu đạt điểm tối đa',
      slug: 'ki-nang-lam-bai-doc-hieu',
      description: 'Bí kíp nhận diện phong cách ngôn ngữ, phương thức biểu đạt, biện pháp tu từ.',
      content: '<p>Để làm tốt phần Đọc hiểu, các em cần nắm chắc các kiến thức Tiếng Việt và làm quen với các dạng câu hỏi thường gặp: nhận biết, thông hiểu, vận dụng, vận dụng cao.</p>',
      imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead2708?auto=format&fit=crop&q=80',
      categoryId: catDocHieu.id,
    },
  });

  // 3. Assignments
  await prisma.assignment.create({
    data: {
      title: 'Bài tập: Cảm nhận đoạn 1 Tây Tiến',
      description: 'Làm bài trong 30 phút',
      content: 'Cảm nhận của anh/chị về đoạn thơ sau trong bài thơ Tây Tiến của Quang Dũng:\n\n"Sông Mã xa rồi Tây Tiến ơi!\nNhớ về rừng núi, nhớ chơi vơi\n...\nMai Châu mùa em thơm nếp xôi"',
      lessonId: lesson1.id,
    },
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
