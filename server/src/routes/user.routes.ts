import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";

export const userRouter = Router();

// All user routes require authentication
userRouter.use(authenticateJwt);

// Profile
userRouter.get("/profile", userController.getProfile);
userRouter.put("/profile", userController.updateProfile);
userRouter.put("/change-password", userController.changePassword);

// Favorites
userRouter.get("/favorites", userController.getFavorites);
userRouter.post("/favorites/:productId", userController.addToFavorites);
userRouter.delete("/favorites/:productId", userController.removeFromFavorites);

// Address Book
userRouter.get("/addresses", userController.getAddresses);
userRouter.post("/addresses", userController.addAddress);
userRouter.put("/addresses/:id", userController.updateAddress);
userRouter.delete("/addresses/:id", userController.deleteAddress);
userRouter.put("/addresses/:id/default", userController.setDefaultAddress);
