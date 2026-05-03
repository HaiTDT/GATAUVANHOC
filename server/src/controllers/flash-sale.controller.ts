import type { Request, Response } from "express";
import { flashSaleService } from "../services/flash-sale.service";

export const flashSaleController = {
  async getFeatured(req: Request, res: Response) {
    try {
      const campaign = await flashSaleService.getFeaturedCampaign();
      res.json(campaign);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  async getAllCampaigns(req: Request, res: Response) {
    try {
      const campaigns = await flashSaleService.getAllCampaigns();
      res.json(campaigns);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  async getCampaign(req: Request, res: Response) {
    try {
      const campaign = await flashSaleService.getCampaignById(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  async createCampaign(req: Request, res: Response) {
    try {
      const { name, startTime, endTime, isActive, isFeatured } = req.body;
      const campaign = await flashSaleService.createCampaign({
        name,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        isActive,
        isFeatured
      });
      res.status(201).json(campaign);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  async updateCampaign(req: Request, res: Response) {
    try {
      const { name, startTime, endTime, isActive, isFeatured } = req.body;
      const campaign = await flashSaleService.updateCampaign(req.params.id, {
        name,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        isActive,
        isFeatured
      });
      res.json(campaign);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  async deleteCampaign(req: Request, res: Response) {
    try {
      await flashSaleService.deleteCampaign(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  async addItem(req: Request, res: Response) {
    try {
      const { productId, discountPercentage, stockLimit } = req.body;
      const item = await flashSaleService.addProductToCampaign(req.params.id, {
        productId,
        discountPercentage: Number(discountPercentage),
        stockLimit: stockLimit ? Number(stockLimit) : undefined
      });
      res.status(201).json(item);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  async removeItem(req: Request, res: Response) {
    try {
      await flashSaleService.removeProductFromCampaign(
        req.params.id,
        req.params.productId
      );
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
};
