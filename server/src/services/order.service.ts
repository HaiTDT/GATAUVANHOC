import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/http-error";

const orderInclude = {
  items: {
    include: {
      product: {
        include: {
          category: true
        }
      }
    }
  }
};

export const orderService = {
  async getUserOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: orderInclude,
      orderBy: {
        createdAt: "desc"
      }
    });
  },

  async getUserOrderDetail(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId
      },
      include: orderInclude
    });

    if (!order) {
      throw new HttpError("Order not found", 404);
    }

    return order;
  }
};
