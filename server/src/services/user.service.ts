import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const userService = {
  async getProfile(userId: string) {
    return (prisma.user as any).findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        birthday: true,
        gender: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
  },

  async updateProfile(userId: string, data: {
    fullName?: string;
    phone?: string;
    birthday?: string | Date | null;
    gender?: string;
    avatar?: string;
  }) {
    const updateData: any = {
      fullName: data.fullName,
      phone: data.phone,
      birthday: data.birthday,
      gender: data.gender,
      avatar: data.avatar
    };

    return (prisma.user as any).update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        birthday: true,
        gender: true,
        avatar: true,
        updatedAt: true
      }
    });
  },

  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.passwordHash) {
      throw new Error("User not found or using social login");
    }

    const isMatch = await bcrypt.compare(currentPass, user.passwordHash);
    if (!isMatch) {
      throw new Error("Current password incorrect");
    }

    const passwordHash = await bcrypt.hash(newPass, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });
  },

  // Favorite Lessons
  async getFavoriteLessons(userId: string) {
    return (prisma as any).favoriteLesson.findMany({
      where: { userId },
      include: { lesson: true },
      orderBy: { createdAt: 'desc' }
    });
  },

  async addToFavoriteLessons(userId: string, lessonId: string) {
    return (prisma as any).favoriteLesson.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: { userId, lessonId },
      update: {}
    });
  },

  async removeFromFavoriteLessons(userId: string, lessonId: string) {
    return (prisma as any).favoriteLesson.delete({
      where: { userId_lessonId: { userId, lessonId } }
    });
  },

  // Submissions
  async getSubmissions(userId: string) {
    return (prisma as any).submission.findMany({
      where: { userId },
      include: { 
        assignment: {
          include: {
            questions: {
              include: { options: true }
            }
          }
        },
        answers: true
      },
      orderBy: { updatedAt: 'desc' }
    });
  },

  async submitAssignment(userId: string, assignmentId: string, content?: string, answers?: any[]) {
    const assignment = await (prisma as any).assignment.findUnique({
      where: { id: assignmentId },
      include: { questions: { include: { options: true } } }
    });

    if (!assignment) throw new Error("Assignment not found");

    let score = null;
    let status: any = 'PENDING';

    if (assignment.type === 'QUIZ' && answers) {
      let correctCount = 0;
      let totalQuestions = assignment.questions.length;
      
      // Auto grade MCQ
      answers.forEach(ans => {
        const question = assignment.questions.find((q: any) => q.id === ans.questionId);
        if (question && question.type === 'MULTIPLE_CHOICE') {
          const correctOption = question.options.find((o: any) => o.isCorrect);
          if (correctOption && correctOption.id === ans.optionId) {
            correctCount++;
            ans.isCorrect = true;
          } else {
            ans.isCorrect = false;
          }
        }
      });

      if (totalQuestions > 0) {
        score = (correctCount / totalQuestions) * 10;
        status = 'GRADED';
      }
    }

    return (prisma as any).submission.create({
      data: {
        userId,
        assignmentId,
        content,
        score,
        status,
        answers: {
          create: answers?.map(ans => ({
            questionId: ans.questionId,
            answerText: ans.answerText,
            optionId: ans.optionId,
            isCorrect: ans.isCorrect
          }))
        }
      },
      include: { answers: true }
    });
  },

  // Address Book
  async getAddresses(userId: string) {
    return (prisma as any).address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  },

  async addAddress(userId: string, data: {
    fullName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    detail: string;
    isDefault?: boolean;
  }) {
    if (data.isDefault) {
      await (prisma as any).address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const count = await (prisma as any).address.count({ where: { userId } });
    const isDefault = count === 0 ? true : (data.isDefault || false);

    return (prisma as any).address.create({
      data: { ...data, userId, isDefault }
    });
  },

  async updateAddress(userId: string, addressId: string, data: any) {
    const address = await (prisma as any).address.findFirst({
      where: { id: addressId, userId }
    });
    if (!address) throw new Error("Address not found or unauthorized");

    if (data.isDefault) {
      await (prisma as any).address.updateMany({
        where: { userId, isDefault: true, id: { not: addressId } },
        data: { isDefault: false }
      });
    }

    return (prisma as any).address.update({
      where: { id: addressId },
      data
    });
  },

  async deleteAddress(userId: string, addressId: string) {
    const address = await (prisma as any).address.findFirst({
      where: { id: addressId, userId }
    });
    if (!address) throw new Error("Address not found or unauthorized");

    await (prisma as any).address.delete({ where: { id: addressId } });

    if (address.isDefault) {
      const anotherAddress = await (prisma as any).address.findFirst({ where: { userId } });
      if (anotherAddress) {
        await (prisma as any).address.update({
          where: { id: anotherAddress.id },
          data: { isDefault: true }
        });
      }
    }
  },

  async setDefaultAddress(userId: string, addressId: string) {
    const address = await (prisma as any).address.findFirst({
      where: { id: addressId, userId }
    });
    if (!address) throw new Error("Address not found or unauthorized");

    await (prisma as any).address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false }
    });

    return (prisma as any).address.update({
      where: { id: addressId },
      data: { isDefault: true }
    });
  }
};
