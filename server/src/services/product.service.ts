import { Prisma } from "@prisma/client";
import { HttpError } from "../lib/http-error";
import { prisma } from "../lib/prisma";

type ProductInput = {
  name?: unknown;
  slug?: unknown;
  description?: unknown;
  brand?: unknown;
  price?: unknown;
  imageUrl?: unknown;
  stock?: unknown;
  isActive?: unknown;
  categoryId?: unknown;
  isFlashSale?: unknown;
};

type ProductQuery = {
  search?: unknown;
  categoryId?: unknown;
  brand?: unknown;
  minPrice?: unknown;
  maxPrice?: unknown;
  sort?: unknown;
  page?: unknown;
  limit?: unknown;
  isFlashSale?: unknown;
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toOptionalString = (value: unknown) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new HttpError("Invalid string field", 400);
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const toRequiredString = (value: unknown, field: string) => {
  const parsed = toOptionalString(value);

  if (!parsed) {
    throw new HttpError(`${field} is required`, 400);
  }

  return parsed;
};

const toOptionalNumber = (value: unknown, field: string) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new HttpError(`${field} must be a valid number`, 400);
  }

  return parsed;
};

const toRequiredPrice = (value: unknown) => {
  const parsed = toOptionalNumber(value, "price");

  if (parsed === undefined || parsed < 0) {
    throw new HttpError("price must be a valid non-negative number", 400);
  }

  return new Prisma.Decimal(parsed);
};

const toOptionalPrice = (value: unknown, field: string) => {
  const parsed = toOptionalNumber(value, field);

  if (parsed === undefined) {
    return undefined;
  }

  if (parsed < 0) {
    throw new HttpError(`${field} must be a non-negative number`, 400);
  }

  return new Prisma.Decimal(parsed);
};

const toOptionalInt = (value: unknown, field: string) => {
  const parsed = toOptionalNumber(value, field);

  if (parsed === undefined) {
    return undefined;
  }

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new HttpError(`${field} must be a non-negative integer`, 400);
  }

  return parsed;
};

const toOptionalBoolean = (value: unknown, field: string) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new HttpError(`${field} must be a boolean`, 400);
};

const toProductCreateData = (input: ProductInput): Prisma.ProductCreateInput => {
  const name = toRequiredString(input.name, "name");
  const categoryId = toRequiredString(input.categoryId, "categoryId");

  return {
    name,
    slug: toOptionalString(input.slug) ?? slugify(name),
    description: toOptionalString(input.description),
    brand: toOptionalString(input.brand),
    price: toRequiredPrice(input.price),
    imageUrl: toOptionalString(input.imageUrl),
    stock: toOptionalInt(input.stock, "stock") ?? 0,
    isActive: toOptionalBoolean(input.isActive, "isActive") ?? true,
    isFlashSale: toOptionalBoolean(input.isFlashSale, "isFlashSale") ?? false,
    category: {
      connect: { id: categoryId }
    }
  };
};

const toProductUpdateData = (input: ProductInput): Prisma.ProductUpdateInput => {
  const data: Prisma.ProductUpdateInput = {};

  if (input.name !== undefined) {
    data.name = toRequiredString(input.name, "name");
  }

  if (input.slug !== undefined) {
    data.slug = toRequiredString(input.slug, "slug");
  }

  if (input.description !== undefined) {
    data.description = toOptionalString(input.description) ?? null;
  }

  if (input.brand !== undefined) {
    data.brand = toOptionalString(input.brand) ?? null;
  }

  if (input.imageUrl !== undefined) {
    data.imageUrl = toOptionalString(input.imageUrl) ?? null;
  }

  if (input.price !== undefined) {
    data.price = toOptionalPrice(input.price, "price");
  }

  if (input.stock !== undefined) {
    data.stock = toOptionalInt(input.stock, "stock");
  }

  if (input.isActive !== undefined) {
    data.isActive = toOptionalBoolean(input.isActive, "isActive");
  }

  if (input.isFlashSale !== undefined) {
    data.isFlashSale = toOptionalBoolean(input.isFlashSale, "isFlashSale");
  }

  if (input.categoryId !== undefined) {
    data.category = {
      connect: {
        id: toRequiredString(input.categoryId, "categoryId")
      }
    };
  }

  if (!Object.keys(data).length) {
    throw new HttpError("No valid product fields provided", 400);
  }

  return data;
};

const getPagination = (query: ProductQuery) => {
  const page = Math.max(1, toOptionalInt(query.page, "page") ?? 1);
  const limit = Math.min(100, Math.max(1, toOptionalInt(query.limit, "limit") ?? 10));

  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
};

const getProductWhere = (query: ProductQuery): Prisma.ProductWhereInput => {
  const where: Prisma.ProductWhereInput = {};
  const search = toOptionalString(query.search);
  const categoryId = toOptionalString(query.categoryId);
  const brand = toOptionalString(query.brand);
  const minPrice = toOptionalPrice(query.minPrice, "minPrice");
  const maxPrice = toOptionalPrice(query.maxPrice, "maxPrice");
  const isFlashSale = toOptionalBoolean(query.isFlashSale, "isFlashSale");

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive"
    };
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (brand) {
    where.brand = {
      contains: brand,
      mode: "insensitive"
    };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};

    if (minPrice !== undefined) {
      where.price.gte = minPrice;
    }

    if (maxPrice !== undefined) {
      where.price.lte = maxPrice;
    }
  }

  if (isFlashSale !== undefined) {
    where.isFlashSale = isFlashSale;
  }

  return where;
};

const getProductOrderBy = (sort: unknown): Prisma.ProductOrderByWithRelationInput => {
  if (sort === "price_asc" || sort === "price:asc" || sort === "asc") {
    return { price: "asc" };
  }

  if (sort === "price_desc" || sort === "price:desc" || sort === "desc") {
    return { price: "desc" };
  }

  return { createdAt: "desc" };
};

const handlePrismaError = (error: unknown): never => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      throw new HttpError("Product slug already exists", 409);
    }

    if (error.code === "P2025") {
      throw new HttpError("Product not found", 404);
    }

    if (error.code === "P2003") {
      throw new HttpError("Related category was not found or product is in use", 409);
    }
  }

  throw error;
};

export const productService = {
  async getAll(query: ProductQuery) {
    const where = getProductWhere(query);
    const orderBy = getProductOrderBy(query.sort);
    const { page, limit, skip } = getPagination(query);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    return {
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async getDetail(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true }
    });

    if (!product) {
      throw new HttpError("Product not found", 404);
    }

    return product;
  },

  async create(input: ProductInput) {
    try {
      return await prisma.product.create({
        data: toProductCreateData(input),
        include: { category: true }
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },

  async update(id: string, input: ProductInput) {
    try {
      return await prisma.product.update({
        where: { id },
        data: toProductUpdateData(input),
        include: { category: true }
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },

  async delete(id: string) {
    try {
      await prisma.product.delete({
        where: { id }
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
};
