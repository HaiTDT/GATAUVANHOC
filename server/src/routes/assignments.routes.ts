import { Router } from "express";
import { PrismaClient } from "@prisma/client";

export const assignmentRouter = Router();
const prisma = new PrismaClient();

// Get all assignments
assignmentRouter.get("/", async (req, res) => {
  try {
    const assignments = await prisma.assignment.findMany({
      include: { 
        lesson: true,
        questions: {
          include: { options: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    
    res.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get assignment by id
assignmentRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: { 
        lesson: true,
        questions: {
          include: { options: true }
        }
      }
    });
    
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    
    res.json(assignment);
  } catch (error) {
    console.error("Error fetching assignment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
