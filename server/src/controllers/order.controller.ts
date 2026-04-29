import type { Request, Response } from "express";
import { HttpError } from "../lib/http-error";
import { orderService } from "../services/order.service";

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

export const orderController = {
  async getOrders(req: Request, res: Response) {
    try {
      const orders = await orderService.getUserOrders(getUserId(req));
      return res.json(orders);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async getOrderDetail(req: Request, res: Response) {
    try {
      const order = await orderService.getUserOrderDetail(
        getUserId(req),
        req.params.id
      );

      return res.json(order);
    } catch (error) {
      return handleError(error, res);
    }
  }
};
