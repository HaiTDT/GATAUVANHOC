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
  async getSubmissions(req: Request, res: Response) {
    try {
      const result = await adminService.getSubmissions(req.query);
      return res.json(result);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async getSubmissionDetail(req: Request, res: Response) {
    try {
      const submission = await adminService.getSubmissionDetail(req.params.id);
      return res.json(submission);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async gradeSubmission(req: Request, res: Response) {
    try {
      const submission = await adminService.gradeSubmission(req.params.id, req.body);
      return res.json(submission);
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
