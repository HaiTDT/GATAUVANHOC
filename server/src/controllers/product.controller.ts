import type { Request, Response } from "express";
import { HttpError } from "../lib/http-error";
import { productService } from "../services/product.service";

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

export const productController = {
  async getAll(req: Request, res: Response) {
    try {
      const result = await productService.getAll(req.query);
      return res.json(result);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async getDetail(req: Request, res: Response) {
    try {
      const product = await productService.getDetail(req.params.id);
      return res.json(product);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const product = await productService.create(req.body);
      return res.status(201).json(product);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const product = await productService.update(req.params.id, req.body);
      return res.json(product);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async delete(req: Request, res: Response) {
    try {
      await productService.delete(req.params.id);
      return res.status(204).send();
    } catch (error) {
      return handleError(error, res);
    }
  }
};
