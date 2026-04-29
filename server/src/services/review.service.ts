import { OrderStatus, Prisma } from "@prisma/client";
import { HttpError } from "../lib/http-error";
import { prisma } from "../lib/prisma";

type ReviewInput = {
  rating?: unknown;
  comment?: unknown;
};

const purchasedStatuses = [
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
  OrderStatus.COMPLETED
];

const toRating = (value: unknown) => {
  const rating = Number(value);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new HttpError("Rating must be an integer from 1 to 5", 400);
  }

  return rating;
};

const toOptionalComment = (value: unknown) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new HttpError("Comment must be a string", 400);
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const getReviewStats = async (productId: string) => {
  const stats = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { id: true }
  });

  const averageRating = stats._avg.rating
    ? Math.round(stats._avg.rating * 10) / 10
    : 0;

  return {
    averageRating,
    totalReviews: stats._count.id
  };
};

const formatReview = <T extends { user: { fullName: string | null; email: string } }>(
  review: T
) => ({
  ...review,
  userName: review.user.fullName ?? review.user.email
});

export const reviewService = {
  async getProductReviews(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true }
    });

    if (!product) {
      throw new HttpError("Product not found", 404);
    }

    const [reviews, stats] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }),
      getReviewStats(productId)
    ]);

    return {
      data: reviews.map(formatReview),
      meta: stats
    };
  },

  async createReview(userId: string, productId: string, input: ReviewInput) {
    const rating = toRating(input.rating);
    const comment = toOptionalComment(input.comment);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true }
    });

    if (!product || !product.isActive) {
      throw new HttpError("Product not found", 404);
    }

    const purchasedItem = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: {
            in: purchasedStatuses
          }
        }
      },
      select: { id: true }
    });

    if (!purchasedItem) {
      throw new HttpError("You can only review products you have purchased", 403);
    }

    try {
      const review = await prisma.review.create({
        data: {
          userId,
          productId,
          rating,
          comment
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      });

      return {
        review: formatReview(review),
        productRating: await getReviewStats(productId)
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new HttpError("You have already reviewed this product", 409);
      }

      throw error;
    }
  }
};
