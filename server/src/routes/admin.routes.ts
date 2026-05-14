import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { requireAdmin } from "../middlewares/admin.middleware";
import { authenticateJwt } from "../middlewares/auth.middleware";

export const adminRouter = Router();

adminRouter.use(authenticateJwt, requireAdmin);

adminRouter.get("/submissions", adminController.getSubmissions);
adminRouter.get("/submissions/:id", adminController.getSubmissionDetail);
adminRouter.put("/submissions/:id", adminController.gradeSubmission);
adminRouter.get("/dashboard", adminController.getDashboard);
