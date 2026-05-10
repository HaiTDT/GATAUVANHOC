import type { Request, Response } from "express";
import { HttpError } from "../lib/http-error";
import { reviewService } from "../services/review.service";

const handleError = (error: unknown, res: Response) => {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      message: error.message
    });
  }

  return res.status(500).json({
    message: "Internal server error"
  });
};

const getUserId = (req: Request) => {
  if (!req.user?.id) {
    throw new HttpError("Unauthorized", 401);
  }

  return req.user.id;
};

export const reviewController = {
  async getProductReviews(req: Request, res: Response) {
    try {
      const result = await reviewService.getProductReviews(req.params.productId);
      return res.json(result);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async checkEligibility(req: Request, res: Response) {
    try {
      const result = await reviewService.checkEligibility(
        getUserId(req),
        req.params.productId
      );
      return res.json(result);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async createReview(req: Request, res: Response) {
    try {
      const result = await reviewService.createReview(
        getUserId(req),
        req.params.productId,
        req.body
      );

      return res.status(201).json(result);
    } catch (error) {
      return handleError(error, res);
    }
  }
};
