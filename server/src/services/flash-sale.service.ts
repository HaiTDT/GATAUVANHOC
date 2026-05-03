import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../lib/prisma";

export class FlashSaleService {
  async getAllCampaigns() {
    return prisma.flashSaleCampaign.findMany({
      include: {
        _count: {
          select: { items: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async getCampaignById(id: string) {
    return prisma.flashSaleCampaign.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
  }

  async createCampaign(data: {
    name: string;
    startTime: Date;
    endTime: Date;
    isActive?: boolean;
    isFeatured?: boolean;
  }) {
    // If isFeatured is true, unset other featured campaigns
    if (data.isFeatured) {
      await prisma.flashSaleCampaign.updateMany({
        where: { isFeatured: true },
        data: { isFeatured: false }
      });
    }

    return prisma.flashSaleCampaign.create({
      data
    });
  }

  async updateCampaign(
    id: string,
    data: {
      name?: string;
      startTime?: Date;
      endTime?: Date;
      isActive?: boolean;
      isFeatured?: boolean;
    }
  ) {
    if (data.isFeatured) {
      await prisma.flashSaleCampaign.updateMany({
        where: {
          id: { not: id },
          isFeatured: true
        },
        data: { isFeatured: false }
      });
    }

    return prisma.flashSaleCampaign.update({
      where: { id },
      data
    });
  }

  async deleteCampaign(id: string) {
    return prisma.flashSaleCampaign.delete({
      where: { id }
    });
  }

  async addProductToCampaign(
    campaignId: string,
    data: {
      productId: string;
      discountPercentage: number;
      stockLimit?: number;
    }
  ) {
    return prisma.flashSaleItem.create({
      data: {
        campaignId,
        productId: data.productId,
        discountPercentage: data.discountPercentage,
        stockLimit: data.stockLimit ?? 0
      }
    });
  }

  async removeProductFromCampaign(campaignId: string, productId: string) {
    return prisma.flashSaleItem.delete({
      where: {
        campaignId_productId: {
          campaignId,
          productId
        }
      }
    });
  }

  async getFeaturedCampaign() {
    const now = new Date();
    return prisma.flashSaleCampaign.findFirst({
      where: {
        isFeatured: true,
        isActive: true,
        startTime: { lte: now },
        endTime: { gte: now }
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });
  }
}

export const flashSaleService = new FlashSaleService();
