import { Router } from "express";
import { categoryController } from "../controllers/category.controller";
import { requireAdmin } from "../middlewares/admin.middleware";
import { authenticateJwt } from "../middlewares/auth.middleware";

export const categoryRouter = Router();

categoryRouter.get("/", categoryController.getAll);
categoryRouter.post("/", authenticateJwt, requireAdmin, categoryController.create);
categoryRouter.put("/:id", authenticateJwt, requireAdmin, categoryController.update);
categoryRouter.delete("/:id", authenticateJwt, requireAdmin, categoryController.delete);
