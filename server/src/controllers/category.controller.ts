import type { Request, Response } from "express";
import { HttpError } from "../lib/http-error";
import { categoryService } from "../services/category.service";

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

export const categoryController = {
  async getAll(_req: Request, res: Response) {
    try {
      const categories = await categoryService.getAll();
      return res.json(categories);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const category = await categoryService.create(req.body);
      return res.status(201).json(category);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const category = await categoryService.update(req.params.id, req.body);
      return res.json(category);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async delete(req: Request, res: Response) {
    try {
      await categoryService.delete(req.params.id);
      return res.status(204).send();
    } catch (error) {
      return handleError(error, res);
    }
  }
};
