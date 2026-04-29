import { Prisma } from "@prisma/client";
import { HttpError } from "../lib/http-error";
import { prisma } from "../lib/prisma";

type BlogInput = {
  title?: unknown;
  excerpt?: unknown;
  content?: unknown;
  imageUrl?: unknown;
  isActive?: unknown;
};

type BlogQuery = {
  search?: unknown;
  page?: unknown;
  limit?: unknown;
  isActive?: unknown;
};

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

const toOptionalInt = (value: unknown, field: string) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const parsed = Number(value);
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

const toBlogCreateData = (input: BlogInput): Prisma.BlogCreateInput => {
  return {
    title: toRequiredString(input.title, "title"),
    content: toRequiredString(input.content, "content"),
    excerpt: toOptionalString(input.excerpt),
    imageUrl: toOptionalString(input.imageUrl),
    isActive: toOptionalBoolean(input.isActive, "isActive") ?? true,
  };
};

const toBlogUpdateData = (input: BlogInput): Prisma.BlogUpdateInput => {
  const data: Prisma.BlogUpdateInput = {};

  if (input.title !== undefined) {
    data.title = toRequiredString(input.title, "title");
  }
  if (input.content !== undefined) {
    data.content = toRequiredString(input.content, "content");
  }
  if (input.excerpt !== undefined) {
    data.excerpt = toOptionalString(input.excerpt) ?? null;
  }
  if (input.imageUrl !== undefined) {
    data.imageUrl = toOptionalString(input.imageUrl) ?? null;
  }
  if (input.isActive !== undefined) {
    data.isActive = toOptionalBoolean(input.isActive, "isActive");
  }

  if (!Object.keys(data).length) {
    throw new HttpError("No valid blog fields provided", 400);
  }
  return data;
};

const getPagination = (query: BlogQuery) => {
  const page = Math.max(1, toOptionalInt(query.page, "page") ?? 1);
  const limit = Math.min(100, Math.max(1, toOptionalInt(query.limit, "limit") ?? 10));

  return { page, limit, skip: (page - 1) * limit };
};

export const blogService = {
  async getAll(query: BlogQuery) {
    const where: Prisma.BlogWhereInput = {};
    const search = toOptionalString(query.search);
    const isActive = toOptionalBoolean(query.isActive, "isActive");

    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const { page, limit, skip } = getPagination(query);

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.blog.count({ where })
    ]);

    return {
      data: blogs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async getDetail(id: string) {
    const blog = await prisma.blog.findUnique({
      where: { id }
    });

    if (!blog) {
      throw new HttpError("Blog not found", 404);
    }
    return blog;
  },

  async create(input: BlogInput) {
    return prisma.blog.create({
      data: toBlogCreateData(input)
    });
  },

  async update(id: string, input: BlogInput) {
    try {
      return await prisma.blog.update({
        where: { id },
        data: toBlogUpdateData(input)
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw new HttpError("Blog not found", 404);
      }
      throw error;
    }
  },

  async delete(id: string) {
    try {
      await prisma.blog.delete({
        where: { id }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw new HttpError("Blog not found", 404);
      }
      throw error;
    }
  }
};
