import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const analyticsService = {
  async getStudentClassification() {
    const students = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      include: {
        submissions: true
      }
    });

    let hocTot = 0;
    let tienBo = 0;
    let canHoTro = 0;
    let nguyCo = 0;

    students.forEach(student => {
      if (student.submissions.length === 0) {
        nguyCo++;
        return;
      }
      
      const graded = student.submissions.filter(s => s.status === "GRADED" && s.score !== null);
      if (graded.length === 0) {
        canHoTro++;
        return;
      }

      const avgScore = graded.reduce((sum, s) => sum + (s.score || 0), 0) / graded.length;
      if (avgScore >= 8) {
        hocTot++;
      } else if (avgScore >= 5) {
        tienBo++;
      } else {
        canHoTro++;
      }
    });

    return {
      labels: ["Học tốt", "Có tiến bộ", "Cần hỗ trợ", "Nguy cơ bỏ học"],
      data: [hocTot, tienBo, canHoTro, nguyCo]
    };
  }
};
