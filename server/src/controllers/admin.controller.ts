import type { Request, Response } from "express";
import { HttpError } from "../lib/http-error";
import { adminService } from "../services/admin.service";

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

export const adminController = {
  async getOrders(req: Request, res: Response) {
    try {
      const result = await adminService.getOrders(req.query);
      return res.json(result);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async getOrderDetail(req: Request, res: Response) {
    try {
      const order = await adminService.getOrderDetail(req.params.id);
      return res.json(order);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async updateOrderStatus(req: Request, res: Response) {
    try {
      const order = await adminService.updateOrderStatus(req.params.id, req.body);
      return res.json(order);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async getDashboard(_req: Request, res: Response) {
    try {
      const dashboard = await adminService.getDashboard();
      return res.json(dashboard);
    } catch (error) {
      return handleError(error, res);
    }
  }
};
