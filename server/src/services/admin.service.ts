import { PrismaClient, Prisma } from "@prisma/client";
import { HttpError } from "../lib/http-error";

const prisma = new PrismaClient();

export const adminService = {
  async getSubmissions(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (query.status) {
      where.status = query.status as any;
    }
    
    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, fullName: true, avatar: true } },
          assignment: { include: { lesson: true } }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.submission.count({ where })
    ]);

    return {
      data: submissions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async getSubmissionDetail(id: string) {
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, fullName: true, avatar: true } },
        assignment: { include: { lesson: true } }
      }
    });

    if (!submission) {
      throw new HttpError("Submission not found", 404);
    }

    return submission;
  },

  async gradeSubmission(id: string, data: { score: number; teacherComment: string }) {
    const submission = await prisma.submission.findUnique({ where: { id } });
    
    if (!submission) {
      throw new HttpError("Submission not found", 404);
    }

    return prisma.submission.update({
      where: { id },
      data: {
        score: data.score,
        teacherComment: data.teacherComment,
        status: "GRADED"
      },
      include: {
        user: { select: { id: true, email: true, fullName: true, avatar: true } },
        assignment: { include: { lesson: true } }
      }
    });
  },

  async getDashboard() {
    const [totalStudents, totalLessons, pendingSubmissions, gradedSubmissions] = await Promise.all([
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.lesson.count(),
      prisma.submission.count({ where: { status: "PENDING" } }),
      prisma.submission.count({ where: { status: "GRADED" } })
    ]);

    // Generate submission trend for the last 7 days
    const today = new Date();
    const submissionTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      const count = await prisma.submission.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });
      
      submissionTrend.push({
        date: startOfDay.toISOString(),
        submissions: count
      });
    }

    return {
      overview: [
        { label: "Tổng học sinh", value: totalStudents },
        { label: "Bài học", value: totalLessons },
        { label: "Bài nộp chờ chấm", value: pendingSubmissions },
        { label: "Bài đã chấm", value: gradedSubmissions }
      ],
      submissionTrend,
      recentSubmissions: await prisma.submission.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { fullName: true, email: true } },
          assignment: { select: { title: true } }
        }
      })
    };
  }
};
