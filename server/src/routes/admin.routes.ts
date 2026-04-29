import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { requireAdmin } from "../middlewares/admin.middleware";
import { authenticateJwt } from "../middlewares/auth.middleware";

export const adminRouter = Router();

adminRouter.use(authenticateJwt, requireAdmin);

adminRouter.get("/orders", adminController.getOrders);
adminRouter.get("/orders/:id", adminController.getOrderDetail);
adminRouter.put("/orders/:id/status", adminController.updateOrderStatus);
adminRouter.get("/dashboard", adminController.getDashboard);
