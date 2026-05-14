import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { optionalAuthenticateJwt } from "../middlewares/optional-auth.middleware";

export const publicCourseRouter = Router();
const prisma = new PrismaClient();

// List active courses
publicCourseRouter.get("/", async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get course detail
publicCourseRouter.get("/:idOrSlug", optionalAuthenticateJwt, async (req: any, res) => {
  try {
    const { idOrSlug } = req.params;
    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        isActive: true
      }
    });

    if (!course) return res.status(404).json({ error: "Course not found" });

    // Check enrollment if user is authenticated
    let isEnrolled = false;
    let enrollment = null;
    const userId = req.user?.id;

    if (userId) {
      enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: course.id } }
      });
      isEnrolled = enrollment?.status === 'PAID';
    }

    res.json({ 
      ...course, 
      isEnrolled,
      enrollment
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get assignments for a course (requires enrollment)
publicCourseRouter.get("/:courseId/assignments", authenticateJwt, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user!.id;

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });

    if (!enrollment || enrollment.status !== 'PAID') {
      return res.status(403).json({ error: "Vui lòng thanh toán khóa học để xem nội dung này." });
    }

    const assignments = await prisma.assignment.findMany({
      where: { courseId },
      include: { 
        questions: { include: { options: true } } 
      },
      orderBy: { createdAt: "asc" }
    });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Enroll in a course
publicCourseRouter.post("/:courseId/enroll", authenticateJwt, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user!.id;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return res.status(404).json({ error: "Course not found" });

    // If course is free, set status to PAID immediately
    const status = course.price === 0 ? 'PAID' : 'PENDING';

    const enrollment = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: { status },
      create: {
        userId,
        courseId,
        status,
        amount: course.price
      }
    });

    res.status(201).json(enrollment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
