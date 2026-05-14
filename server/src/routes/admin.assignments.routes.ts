import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";

export const adminAssignmentRouter = Router();
const prisma = new PrismaClient();

adminAssignmentRouter.use(authenticateJwt, requireAdmin);

// Get assignments for a lesson
adminAssignmentRouter.get("/lessons/:lessonId/assignments", async (req, res) => {
  try {
    const assignments = await prisma.assignment.findMany({
      where: { lessonId: req.params.lessonId },
      include: { 
        questions: {
          include: { options: true }
        }
      },
      orderBy: { createdAt: "asc" }
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create assignment
adminAssignmentRouter.post("/lessons/:lessonId/assignments", async (req, res) => {
  try {
    const { title, description, content, type, points, questions } = req.body;
    const { lessonId } = req.params;

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        content,
        type,
        points: Number(points) || 10,
        lessonId,
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
      },
      include: {
        questions: {
          include: { options: true }
        }
      }
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error("Error creating assignment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete assignment
adminAssignmentRouter.delete("/assignments/:id", async (req, res) => {
  try {
    await prisma.assignment.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
