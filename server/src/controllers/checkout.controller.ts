import type { Request, Response } from "express";
import { HttpError } from "../lib/http-error";
import { checkoutService } from "../services/checkout.service";

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

export const checkoutController = {
  async checkout(req: Request, res: Response) {
    try {
      const result = await checkoutService.checkout(getUserId(req), req.body);
      return res.status(201).json(result);
    } catch (error) {
      return handleError(error, res);
    }
  }
};
