import { Router } from "express";
import { cartController } from "../controllers/cart.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";

export const cartRouter = Router();

cartRouter.use(authenticateJwt);

cartRouter.get("/", cartController.getCart);
cartRouter.post("/items", cartController.addItem);
cartRouter.put("/items/:itemId", cartController.updateItem);
cartRouter.delete("/items/:itemId", cartController.deleteItem);
