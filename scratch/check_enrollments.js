const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  console.log('--- PHÂN TÍCH DỮ LIỆU ĐĂNG KÝ ---');
  
  const enrollments = await prisma.enrollment.findMany({
    include: {
      user: { select: { email: true, fullName: true } },
      course: { select: { title: true } }
    }
  });

  if (enrollments.length === 0) {
    console.log('Không tìm thấy bản ghi đăng ký nào trong DB.');
  } else {
    enrollments.forEach(e => {
      console.log(`Học viên: ${e.user.email} (${e.user.fullName})`);
      console.log(`Khóa học: ${e.course.title}`);
      console.log(`Trạng thái: ${e.status}`);
      console.log('---------------------------');
    });
  }

  process.exit(0);
}

test();
