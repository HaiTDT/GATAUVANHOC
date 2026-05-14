import type { Request, Response } from "express";
import { HttpError } from "../lib/http-error";
import { analyticsService } from "../services/analytics.service";

const handleError = (error: unknown, res: Response) => {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      message: error.message
    });
  }

  console.error("[analytics]", error);
  return res.status(500).json({
    message: "Internal server error"
  });
};

export const analyticsController = {
  async getStudentClassification(req: Request, res: Response) {
    try {
      const result = await analyticsService.getStudentClassification();
      return res.json(result);
    } catch (error) {
      return handleError(error, res);
    }
  }
};
