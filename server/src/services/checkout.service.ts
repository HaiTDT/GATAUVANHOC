import { OrderStatus, Prisma } from "@prisma/client";
import { HttpError } from "../lib/http-error";
import { prisma } from "../lib/prisma";

type CheckoutInput = {
  shippingName?: unknown;
  shippingPhone?: unknown;
  shippingAddress?: unknown;
};

const toRequiredString = (value: unknown, field: string) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpError(`${field} is required`, 400);
  }

  return value.trim();
};

const toCheckoutData = (input: CheckoutInput) => ({
  shippingName: toRequiredString(input.shippingName, "shippingName"),
  shippingPhone: toRequiredString(input.shippingPhone, "shippingPhone"),
  shippingAddress: toRequiredString(input.shippingAddress, "shippingAddress")
});

export const checkoutService = {
  async checkout(userId: string, input: CheckoutInput) {
    const checkoutData = toCheckoutData(input);

    return prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      if (!cart || cart.items.length === 0) {
        throw new HttpError("Cart is empty", 400);
      }

      for (const item of cart.items) {
        if (!item.product.isActive) {
          throw new HttpError(
            `Product ${item.product.name} is no longer available`,
            409
          );
        }

        if (item.quantity > item.product.stock) {
          throw new HttpError(
            `Not enough stock for product ${item.product.name}`,
            409
          );
        }
      }

      const totalAmount = cart.items.reduce(
        (total, item) => total.plus(item.product.price.mul(item.quantity)),
        new Prisma.Decimal(0)
      );

      for (const item of cart.items) {
        const stockUpdate = await tx.product.updateMany({
          where: {
            id: item.productId,
            isActive: true,
            stock: {
              gte: item.quantity
            }
          },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });

        if (stockUpdate.count !== 1) {
          throw new HttpError(
            `Not enough stock for product ${item.product.name}`,
            409
          );
        }
      }

      const order = await tx.order.create({
        data: {
          userId,
          status: OrderStatus.PAID,
          totalAmount,
          shippingName: checkoutData.shippingName,
          shippingPhone: checkoutData.shippingPhone,
          shippingAddress: checkoutData.shippingAddress,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.product.price
            }))
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      await tx.cart.delete({
        where: {
          id: cart.id
        }
      });

      return {
        message: "Checkout completed successfully",
        payment: {
          provider: "mock",
          status: "paid"
        },
        order
      };
    });
  }
};
