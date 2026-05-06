import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const userService = {
  async getProfile(userId: string) {
    return (prisma.user as any).findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        birthday: true,
        gender: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
  },

  async updateProfile(userId: string, data: {
    fullName?: string;
    phone?: string;
    birthday?: string | Date | null;
    gender?: string;
    avatar?: string;
  }) {
    const updateData: any = {
      fullName: data.fullName,
      phone: data.phone,
      birthday: data.birthday,
      gender: data.gender,
      avatar: data.avatar
    };

    return (prisma.user as any).update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        birthday: true,
        gender: true,
        avatar: true,
        updatedAt: true
      }
    });
  },

  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.passwordHash) {
      throw new Error("User not found or using social login");
    }

    const isMatch = await bcrypt.compare(currentPass, user.passwordHash);
    if (!isMatch) {
      throw new Error("Current password incorrect");
    }

    const passwordHash = await bcrypt.hash(newPass, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });
  },

  // Favorites
  async getFavorites(userId: string) {
    return (prisma as any).favoriteProduct.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' }
    });
  },

  async addToFavorites(userId: string, productId: string) {
    return (prisma as any).favoriteProduct.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId },
      update: {}
    });
  },

  async removeFromFavorites(userId: string, productId: string) {
    return (prisma as any).favoriteProduct.delete({
      where: { userId_productId: { userId, productId } }
    });
  },

  // Address Book
  async getAddresses(userId: string) {
    return (prisma as any).address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  },

  async addAddress(userId: string, data: {
    fullName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    detail: string;
    isDefault?: boolean;
  }) {
    if (data.isDefault) {
      await (prisma as any).address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const count = await (prisma as any).address.count({ where: { userId } });
    const isDefault = count === 0 ? true : (data.isDefault || false);

    return (prisma as any).address.create({
      data: { ...data, userId, isDefault }
    });
  },

  async updateAddress(userId: string, addressId: string, data: any) {
    const address = await (prisma as any).address.findFirst({
      where: { id: addressId, userId }
    });
    if (!address) throw new Error("Address not found or unauthorized");

    if (data.isDefault) {
      await (prisma as any).address.updateMany({
        where: { userId, isDefault: true, id: { not: addressId } },
        data: { isDefault: false }
      });
    }

    return (prisma as any).address.update({
      where: { id: addressId },
      data
    });
  },

  async deleteAddress(userId: string, addressId: string) {
    const address = await (prisma as any).address.findFirst({
      where: { id: addressId, userId }
    });
    if (!address) throw new Error("Address not found or unauthorized");

    await (prisma as any).address.delete({ where: { id: addressId } });

    if (address.isDefault) {
      const anotherAddress = await (prisma as any).address.findFirst({ where: { userId } });
      if (anotherAddress) {
        await (prisma as any).address.update({
          where: { id: anotherAddress.id },
          data: { isDefault: true }
        });
      }
    }
  },

  async setDefaultAddress(userId: string, addressId: string) {
    const address = await (prisma as any).address.findFirst({
      where: { id: addressId, userId }
    });
    if (!address) throw new Error("Address not found or unauthorized");

    await (prisma as any).address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false }
    });

    return (prisma as any).address.update({
      where: { id: addressId },
      data: { isDefault: true }
    });
  }
};
