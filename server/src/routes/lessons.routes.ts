import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";

export const lessonRouter = Router();
const prisma = new PrismaClient();

// Get all lessons with pagination
lessonRouter.get("/", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { categoryId, search, grade } = req.query;
    
    let where: any = {};
    if (categoryId) {
      where.categoryId = String(categoryId);
    }
    if (search) {
      where.title = { contains: String(search), mode: 'insensitive' };
    }
    if (grade) {
      const gradeArr = String(grade).split(',').map(Number);
      if (gradeArr.length > 1) {
        where.grade = { in: gradeArr };
      } else {
        where.grade = gradeArr[0];
      }
    }

    const [lessons, total] = await Promise.all([
      prisma.lesson.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.lesson.count({ where })
    ]);
    
    res.json({
      data: lessons,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get lesson by id/slug
lessonRouter.get("/:idOrSlug", async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    
    const lesson = await prisma.lesson.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug }
        ]
      },
      include: { 
        category: true, 
        assignments: {
          include: {
            questions: {
              include: { options: true }
            }
          }
        } 
      }
    });
    
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }
    
    res.json(lesson);
  } catch (error) {
    console.error("Error fetching lesson:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create lesson (Admin only)
lessonRouter.post("/", authenticateJwt, requireAdmin, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.grade === "" || data.grade === undefined) {
      data.grade = null;
    } else if (typeof data.grade === 'string') {
      data.grade = parseInt(data.grade, 10);
    }
    
    const lesson = await prisma.lesson.create({
      data
    });
    res.status(201).json(lesson);
  } catch (error) {
    console.error("Error creating lesson:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update lesson (Admin only)
lessonRouter.put("/:id", authenticateJwt, requireAdmin, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.grade === "" || data.grade === undefined) {
      data.grade = null;
    } else if (typeof data.grade === 'string') {
      data.grade = parseInt(data.grade, 10);
    }

    const lesson = await prisma.lesson.update({
      where: { id: req.params.id },
      data
    });
    res.json(lesson);
  } catch (error) {
    console.error("Error updating lesson:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete lesson (Admin only)
lessonRouter.delete("/:id", authenticateJwt, requireAdmin, async (req, res) => {
  try {
    await prisma.lesson.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting lesson:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
