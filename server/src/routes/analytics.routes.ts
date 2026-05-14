import { Router } from "express";
import { analyticsController } from "../controllers/analytics.controller";
import { requireAdmin } from "../middlewares/admin.middleware";
import { authenticateJwt } from "../middlewares/auth.middleware";

export const analyticsRouter = Router();

analyticsRouter.use(authenticateJwt, requireAdmin);

analyticsRouter.get("/students", analyticsController.getStudentClassification);
