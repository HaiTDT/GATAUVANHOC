import { Router } from "express";
import { flashSaleController } from "../controllers/flash-sale.controller";
import { requireAdmin } from "../middlewares/admin.middleware";
import { authenticateJwt } from "../middlewares/auth.middleware";

export const flashSaleRouter = Router();

// Public routes
flashSaleRouter.get("/featured", flashSaleController.getFeatured);

// Admin routes
flashSaleRouter.get("/", authenticateJwt, requireAdmin, flashSaleController.getAllCampaigns);
flashSaleRouter.post("/", authenticateJwt, requireAdmin, flashSaleController.createCampaign);
flashSaleRouter.get("/:id", authenticateJwt, requireAdmin, flashSaleController.getCampaign);
flashSaleRouter.put("/:id", authenticateJwt, requireAdmin, flashSaleController.updateCampaign);
flashSaleRouter.delete("/:id", authenticateJwt, requireAdmin, flashSaleController.deleteCampaign);

// Campaign items
flashSaleRouter.post("/:id/items", authenticateJwt, requireAdmin, flashSaleController.addItem);
flashSaleRouter.delete("/:id/items/:productId", authenticateJwt, requireAdmin, flashSaleController.removeItem);
