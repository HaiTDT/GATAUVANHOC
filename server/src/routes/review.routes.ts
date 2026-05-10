import { Router } from "express";
import { reviewController } from "../controllers/review.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";

export const reviewRouter = Router({ mergeParams: true });

reviewRouter.get("/eligibility", authenticateJwt, reviewController.checkEligibility);
reviewRouter.get("/", reviewController.getProductReviews);
reviewRouter.post("/", authenticateJwt, reviewController.createReview);
