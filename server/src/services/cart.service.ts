import { Prisma } from "@prisma/client";
import { HttpError } from "../lib/http-error";
import { prisma } from "../lib/prisma";

type CartItemInput = {
  productId?: unknown;
  quantity?: unknown;
};

type CartItemUpdateInput = {
  quantity?: unknown;
};

const cartInclude = {
  items: {
    include: {
      product: {
        include: {
          category: true
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  }
} satisfies Prisma.CartInclude;

type CartWithItems = Prisma.CartGetPayload<{ include: typeof cartInclude }>;

const toRequiredString = (value: unknown, field: string) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpError(`${field} is required`, 400);
  }

  return value.trim();
};

const toPositiveInt = (value: unknown, field: string) => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new HttpError(`${field} must be a positive integer`, 400);
  }

  return parsed;
};

const formatCart = (cart: CartWithItems) => {
  const items = cart.items.map((item) => ({
    ...item,
    lineTotal: item.product.price.mul(item.quantity).toFixed(2)
  }));

  const totalAmount = cart.items
    .reduce(
      (total, item) => total.plus(item.product.price.mul(item.quantity)),
      new Prisma.Decimal(0)
    )
    .toFixed(2);

  const totalQuantity = cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return {
    ...cart,
    items,
    totalQuantity,
    totalAmount
  };
};

const getOrCreateCart = async (userId: string) => {
  const existingCart = await prisma.cart.findUnique({
    where: { userId },
    include: cartInclude
  });

  if (existingCart) {
    return existingCart;
  }

  return prisma.cart.create({
    data: {
      userId
    },
    include: cartInclude
  });
};

const getCartOrThrow = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: cartInclude
  });

  if (!cart) {
    throw new HttpError("Cart not found", 404);
  }

  return cart;
};

export const cartService = {
  async getCart(userId: string) {
    const cart = await getOrCreateCart(userId);
    return formatCart(cart);
  },

  async addItem(userId: string, input: CartItemInput) {
    const productId = toRequiredString(input.productId, "productId");
    const quantity = toPositiveInt(input.quantity, "quantity");

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        isActive: true,
        stock: true
      }
    });

    if (!product || !product.isActive) {
      throw new HttpError("Product not found", 404);
    }

    const cart = await getOrCreateCart(userId);
    const existingItem = cart.items.find((item) => item.productId === productId);
    const newQuantity = (existingItem?.quantity ?? 0) + quantity;

    if (newQuantity > product.stock) {
      throw new HttpError("Not enough product stock", 409);
    }

    await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId
        }
      },
      create: {
        cartId: cart.id,
        productId,
        quantity
      },
      update: {
        quantity: newQuantity
      }
    });

    const updatedCart = await getCartOrThrow(userId);
    return formatCart(updatedCart);
  },

  async updateItem(userId: string, itemId: string, input: CartItemUpdateInput) {
    const quantity = toPositiveInt(input.quantity, "quantity");
    const cart = await getCartOrThrow(userId);

    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id
      },
      include: {
        product: {
          select: {
            id: true,
            isActive: true,
            stock: true
          }
        }
      }
    });

    if (!item) {
      throw new HttpError("Cart item not found", 404);
    }

    if (!item.product.isActive) {
      throw new HttpError("Product is no longer available", 409);
    }

    if (quantity > item.product.stock) {
      throw new HttpError("Not enough product stock", 409);
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity }
    });

    const updatedCart = await getCartOrThrow(userId);
    return formatCart(updatedCart);
  },

  async deleteItem(userId: string, itemId: string) {
    const cart = await getCartOrThrow(userId);

    const result = await prisma.cartItem.deleteMany({
      where: {
        id: itemId,
        cartId: cart.id
      }
    });

    if (result.count === 0) {
      throw new HttpError("Cart item not found", 404);
    }

    const updatedCart = await getCartOrThrow(userId);
    return formatCart(updatedCart);
  }
};
