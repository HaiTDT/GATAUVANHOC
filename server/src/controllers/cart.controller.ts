import type { Request, Response } from "express";
import { HttpError } from "../lib/http-error";
import { cartService } from "../services/cart.service";

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

export const cartController = {
  async getCart(req: Request, res: Response) {
    try {
      const cart = await cartService.getCart(getUserId(req));
      return res.json(cart);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async addItem(req: Request, res: Response) {
    try {
      const cart = await cartService.addItem(getUserId(req), req.body);
      return res.status(201).json(cart);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async updateItem(req: Request, res: Response) {
    try {
      const cart = await cartService.updateItem(
        getUserId(req),
        req.params.itemId,
        req.body
      );

      return res.json(cart);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async deleteItem(req: Request, res: Response) {
    try {
      const cart = await cartService.deleteItem(getUserId(req), req.params.itemId);
      return res.json(cart);
    } catch (error) {
      return handleError(error, res);
    }
  }
};
