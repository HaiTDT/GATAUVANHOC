import { Router } from "express";
import { orderController } from "../controllers/order.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";

export const orderRouter = Router();

orderRouter.use(authenticateJwt);

orderRouter.get("/", orderController.getOrders);
orderRouter.get("/:id", orderController.getOrderDetail);
