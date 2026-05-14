import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";

export const adminCourseRouter = Router();
const prisma = new PrismaClient();

adminCourseRouter.use(authenticateJwt, requireAdmin);

// CRUD Courses
adminCourseRouter.get("/courses", async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

adminCourseRouter.get("/courses/:id", async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id }
    });
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

adminCourseRouter.post("/courses", async (req, res) => {
  try {
    const { title, slug, description, content, price, imageUrl, isActive } = req.body;
    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        content,
        price: Number(price) || 0,
        imageUrl,
        isActive: isActive !== undefined ? isActive : true
      }
    });
    res.status(201).json(course);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

adminCourseRouter.put("/courses/:id", async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.price) data.price = Number(data.price);
    
    const course = await prisma.course.update({
      where: { id: req.params.id },
      data
    });
    res.json(course);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

adminCourseRouter.delete("/courses/:id", async (req, res) => {
  try {
    await prisma.course.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

adminCourseRouter.get("/courses/:courseId/assignments", async (req, res) => {
  try {
    const assignments = await prisma.assignment.findMany({
      where: { courseId: req.params.courseId },
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

adminCourseRouter.post("/courses/:courseId/assignments", async (req, res) => {
  try {
    const { title, description, content, type, points, questions } = req.body;
    const { courseId } = req.params;

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        content,
        type,
        points: Number(points) || 10,
        courseId,
        questions: {
          create: questions?.map((q: any) => ({
            text: q.text,
            type: q.type,
            points: Number(q.points) || 1,
            order: Number(q.order) || 0,
            options: {
              create: q.options?.map((o: any) => ({
                text: o.text,
                isCorrect: o.isCorrect
              }))
            }
          }))
        }
      }
    });
    res.status(201).json(assignment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Enrollment Management
adminCourseRouter.get("/enrollments", async (req, res) => {
  console.log("Admin: Fetching all enrollments...");
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        user: {
          select: { id: true, email: true, fullName: true, phone: true }
        },
        course: {
          select: { id: true, title: true, price: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    console.log(`Admin: Found ${enrollments.length} enrollments.`);
    res.json(enrollments);
  } catch (error) {
    console.error("Admin: Error fetching enrollments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

adminCourseRouter.put("/enrollments/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  console.log(`Admin: Updating enrollment ${id} to status ${status}`);
  try {
    const enrollment = await prisma.enrollment.update({
      where: { id },
      data: { status }
    });
    res.json(enrollment);
  } catch (error: any) {
    console.error("Admin: Error updating enrollment:", error);
    res.status(400).json({ error: error.message });
  }
});
