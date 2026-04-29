import { Router } from "express";
import { productController } from "../controllers/product.controller";
import { requireAdmin } from "../middlewares/admin.middleware";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { reviewRouter } from "./review.routes";

export const productRouter = Router();

productRouter.get("/", productController.getAll);
productRouter.use("/:productId/reviews", reviewRouter);
productRouter.get("/:id", productController.getDetail);
productRouter.post("/", authenticateJwt, requireAdmin, productController.create);
productRouter.put("/:id", authenticateJwt, requireAdmin, productController.update);
productRouter.delete("/:id", authenticateJwt, requireAdmin, productController.delete);
