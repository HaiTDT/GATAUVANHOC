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
  async getRevenueAnalytics(req: Request, res: Response) {
    try {
      const result = await analyticsService.getRevenueAnalytics(req.query);
      return res.json(result);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async getCustomerSegmentation(req: Request, res: Response) {
    try {
      const result = await analyticsService.getCustomerSegmentation(req.query);
      return res.json(result);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async getMarketingAnalytics(_req: Request, res: Response) {
    try {
      const result = await analyticsService.getMarketingAnalytics();
      return res.json(result);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async getInventoryAnalytics(_req: Request, res: Response) {
    try {
      const result = await analyticsService.getInventoryAnalytics();
      return res.json(result);
    } catch (error) {
      return handleError(error, res);
    }
  }
};
