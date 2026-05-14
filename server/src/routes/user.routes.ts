import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";

export const userRouter = Router();

// All user routes require authentication
userRouter.use(authenticateJwt);

// Profile
userRouter.get("/profile", userController.getProfile);
userRouter.put("/profile", userController.updateProfile);
userRouter.put("/change-password", userController.changePassword);

// Favorites (Lessons)
userRouter.get("/favorite-lessons", userController.getFavoriteLessons);
userRouter.post("/favorite-lessons/:lessonId", userController.addToFavoriteLessons);
userRouter.delete("/favorite-lessons/:lessonId", userController.removeFromFavoriteLessons);

// Submissions
userRouter.get("/submissions", userController.getSubmissions);
userRouter.post("/submissions", userController.submitAssignment);

// Address Book
userRouter.get("/addresses", userController.getAddresses);
userRouter.post("/addresses", userController.addAddress);
userRouter.put("/addresses/:id", userController.updateAddress);
userRouter.delete("/addresses/:id", userController.deleteAddress);
userRouter.put("/addresses/:id/default", userController.setDefaultAddress);

// Enrolled Courses
userRouter.get("/courses", async (req: any, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const userId = req.user.id;

    const enrollments = await prisma.enrollment.findMany({
      where: { 
        userId,
        status: 'PAID'
      },
      include: {
        course: true
      },
      orderBy: { createdAt: "desc" }
    });

    const courses = enrollments.map((e: any) => e.course);
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
