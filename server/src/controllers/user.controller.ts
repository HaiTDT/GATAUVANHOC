import type { Request, Response } from "express";
import { userService } from "../services/user.service";

export const userController = {
  async getProfile(req: Request, res: Response) {
    try {
      const user = await userService.getProfile(req.user!.id);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  async updateProfile(req: Request, res: Response) {
    try {
      const data = { ...req.body };
      if (data.birthday) {
        const date = new Date(data.birthday);
        if (!isNaN(date.getTime())) {
          data.birthday = date.toISOString();
        } else {
          data.birthday = null;
        }
      } else if (data.birthday === "") {
        data.birthday = null;
      }
      const user = await userService.updateProfile(req.user!.id, data);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  async changePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Missing passwords" });
      }
      await userService.changePassword(req.user!.id, currentPassword, newPassword);
      res.json({ message: "Password updated successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  // Favorite Lessons
  async getFavoriteLessons(req: Request, res: Response) {
    try {
      const favorites = await userService.getFavoriteLessons(req.user!.id);
      res.json(favorites);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  async addToFavoriteLessons(req: Request, res: Response) {
    try {
      const { lessonId } = req.params;
      await userService.addToFavoriteLessons(req.user!.id, lessonId);
      res.status(201).json({ message: "Added to favorites" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  async removeFromFavoriteLessons(req: Request, res: Response) {
    try {
      const { lessonId } = req.params;
      await userService.removeFromFavoriteLessons(req.user!.id, lessonId);
      res.json({ message: "Removed from favorites" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  // Submissions
  async getSubmissions(req: Request, res: Response) {
    try {
      const submissions = await userService.getSubmissions(req.user!.id);
      res.json(submissions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  async submitAssignment(req: Request, res: Response) {
    try {
      const { assignmentId, content, answers } = req.body;
      const submission = await userService.submitAssignment(req.user!.id, assignmentId, content, answers);
      res.status(201).json(submission);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  // Addresses
  async getAddresses(req: Request, res: Response) {
    try {
      const addresses = await userService.getAddresses(req.user!.id);
      res.json(addresses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  async addAddress(req: Request, res: Response) {
    try {
      const address = await userService.addAddress(req.user!.id, req.body);
      res.status(201).json(address);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  async updateAddress(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const address = await userService.updateAddress(req.user!.id, id, req.body);
      res.json(address);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  async deleteAddress(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await userService.deleteAddress(req.user!.id, id);
      res.json({ message: "Address deleted" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  async setDefaultAddress(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const address = await userService.setDefaultAddress(req.user!.id, id);
      res.json(address);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
};
