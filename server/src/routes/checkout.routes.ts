import { Router } from "express";
import { checkoutController } from "../controllers/checkout.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";

export const checkoutRouter = Router();

checkoutRouter.post("/", authenticateJwt, checkoutController.checkout);
