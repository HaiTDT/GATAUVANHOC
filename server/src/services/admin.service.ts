import { OrderStatus, Prisma, Role } from "@prisma/client";
import { HttpError } from "../lib/http-error";
import { prisma } from "../lib/prisma";

type AdminOrderQuery = {
  status?: unknown;
  page?: unknown;
  limit?: unknown;
};

type UpdateOrderStatusInput = {
  status?: unknown;
};

const adminOrderInclude = {
  user: {
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      role: true
    }
  },
  items: {
    include: {
      product: true
    }
  }
} satisfies Prisma.OrderInclude;

const allowedUpdateStatuses = [
  OrderStatus.PENDING,
  OrderStatus.PAID,
  OrderStatus.CANCELLED,
  OrderStatus.COMPLETED
] as const;

const toOptionalInt = (value: unknown, field: string) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new HttpError(`${field} must be a positive integer`, 400);
  }

  return parsed;
};

const getPagination = (query: AdminOrderQuery) => {
  const page = toOptionalInt(query.page, "page") ?? 1;
  const limit = Math.min(toOptionalInt(query.limit, "limit") ?? 10, 100);

  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
};

const toOrderStatus = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (
    typeof value === "string" &&
    Object.values(OrderStatus).includes(value as OrderStatus)
  ) {
    return value as OrderStatus;
  }

  throw new HttpError("Invalid order status", 400);
};

const toAllowedUpdateStatus = (value: unknown) => {
  const status = toOrderStatus(value);

  if (!status || !allowedUpdateStatuses.includes(status as typeof allowedUpdateStatuses[number])) {
    throw new HttpError(
      "Status must be one of: PENDING, PAID, CANCELLED, COMPLETED",
      400
    );
  }

  return status;
};

const toDecimalString = (value: Prisma.Decimal | null) =>
  (value ?? new Prisma.Decimal(0)).toFixed(2);

export const adminService = {
  async getOrders(query: AdminOrderQuery) {
    const status = toOrderStatus(query.status);
    const { page, limit, skip } = getPagination(query);
    const where: Prisma.OrderWhereInput = status ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: adminOrderInclude,
        orderBy: {
          createdAt: "desc"
        },
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ]);

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async getOrderDetail(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: adminOrderInclude
    });

    if (!order) {
      throw new HttpError("Order not found", 404);
    }

    return order;
  },

  async updateOrderStatus(orderId: string, input: UpdateOrderStatusInput) {
    const status = toAllowedUpdateStatus(input.status);

    try {
      return await prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: adminOrderInclude
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new HttpError("Order not found", 404);
      }

      throw error;
    }
  },

  async getDashboard() {
    const [
      revenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      topProductRows,
      recentOrders
    ] = await Promise.all([
      prisma.order.aggregate({
        where: {
          status: {
            in: [OrderStatus.PAID, OrderStatus.COMPLETED]
          }
        },
        _sum: {
          totalAmount: true
        }
      }),
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count({
        where: {
          role: Role.CUSTOMER
        }
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: {
          quantity: true
        },
        _count: {
          id: true
        },
        orderBy: {
          _sum: {
            quantity: "desc"
          }
        },
        take: 5
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc"
        },
        include: adminOrderInclude
      })
    ]);

    const topProductIds = topProductRows.map((row) => row.productId);
    const topProducts = await prisma.product.findMany({
      where: {
        id: {
          in: topProductIds
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        brand: true,
        price: true,
        imageUrl: true
      }
    });

    const productById = new Map(
      topProducts.map((product) => [product.id, product])
    );

    return {
      totalRevenue: toDecimalString(revenue._sum.totalAmount),
      totalOrders,
      totalProducts,
      totalCustomers,
      topProducts: topProductRows.map((row) => ({
        product: productById.get(row.productId) ?? null,
        totalSold: row._sum.quantity ?? 0,
        orderItemCount: row._count.id
      })),
      recentOrders
    };
  }
};
