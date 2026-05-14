import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";

export const bannerRouter = Router();
const prisma = new PrismaClient();

// Get all active banners for public
bannerRouter.get("/", async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" }
    });
    res.json(banners);
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: Get all banners
bannerRouter.get("/admin-all", authenticateJwt, requireAdmin, async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { order: "asc" }
    });
    res.json(banners);
  } catch (error) {
    console.error("Error fetching admin banners:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create banner
bannerRouter.post("/", authenticateJwt, requireAdmin, async (req, res) => {
  try {
    const { title, subtitle, imageUrl, linkUrl, order, isActive } = req.body;
    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle,
        imageUrl,
        linkUrl,
        order: Number(order) || 0,
        isActive: isActive !== undefined ? isActive : true
      }
    });
    res.status(201).json(banner);
  } catch (error) {
    console.error("Error creating banner:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update banner
bannerRouter.put("/:id", authenticateJwt, requireAdmin, async (req, res) => {
  try {
    const { title, subtitle, imageUrl, linkUrl, order, isActive } = req.body;
    const banner = await prisma.banner.update({
      where: { id: req.params.id },
      data: {
        title,
        subtitle,
        imageUrl,
        linkUrl,
        order: order !== undefined ? Number(order) : undefined,
        isActive: isActive !== undefined ? isActive : undefined
      }
    });
    res.json(banner);
  } catch (error) {
    console.error("Error updating banner:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete banner
bannerRouter.delete("/:id", authenticateJwt, requireAdmin, async (req, res) => {
  try {
    await prisma.banner.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
