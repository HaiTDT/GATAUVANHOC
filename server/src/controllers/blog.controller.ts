import type { Request, Response } from "express";
import { HttpError } from "../lib/http-error";
import { blogService } from "../services/blog.service";

const handleError = (error: unknown, res: Response) => {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  return res.status(500).json({ message: "Internal server error" });
};

export const blogController = {
  async getAll(req: Request, res: Response) {
    try {
      const result = await blogService.getAll(req.query);
      return res.json(result);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async getDetail(req: Request, res: Response) {
    try {
      const blog = await blogService.getDetail(req.params.id);
      return res.json(blog);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const blog = await blogService.create(req.body);
      return res.status(201).json(blog);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const blog = await blogService.update(req.params.id, req.body);
      return res.json(blog);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async delete(req: Request, res: Response) {
    try {
      await blogService.delete(req.params.id);
      return res.status(204).send();
    } catch (error) {
      return handleError(error, res);
    }
  }
};
