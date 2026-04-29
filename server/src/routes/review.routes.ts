import { Router } from "express";
import { reviewController } from "../controllers/review.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";

export const reviewRouter = Router({ mergeParams: true });

reviewRouter.get("/", reviewController.getProductReviews);
reviewRouter.post("/", authenticateJwt, reviewController.createReview);
