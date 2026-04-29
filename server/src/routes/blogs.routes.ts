import { Router } from "express";
import { blogController } from "../controllers/blog.controller";
import { requireAdmin } from "../middlewares/admin.middleware";
import { authenticateJwt } from "../middlewares/auth.middleware";

export const blogRouter = Router();

blogRouter.get("/", blogController.getAll);
blogRouter.get("/:id", blogController.getDetail);
blogRouter.post("/", authenticateJwt, requireAdmin, blogController.create);
blogRouter.put("/:id", authenticateJwt, requireAdmin, blogController.update);
blogRouter.delete("/:id", authenticateJwt, requireAdmin, blogController.delete);
