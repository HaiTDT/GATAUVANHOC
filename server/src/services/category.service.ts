import { Prisma } from "@prisma/client";
import { HttpError } from "../lib/http-error";
import { prisma } from "../lib/prisma";

type CategoryInput = {
  name?: unknown;
  slug?: unknown;
  description?: unknown;
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

const toCategoryCreateData = (input: CategoryInput) => {
  const name = toOptionalString(input.name);

  if (!name) {
    throw new HttpError("Category name is required", 400);
  }

  return {
    name,
    slug: toOptionalString(input.slug) ?? slugify(name),
    description: toOptionalString(input.description)
  };
};

const toCategoryUpdateData = (input: CategoryInput) => {
  const data: Prisma.CategoryUpdateInput = {};
  const name = toOptionalString(input.name);
  const slug = toOptionalString(input.slug);
  const description = toOptionalString(input.description);

  if (name !== undefined) {
    data.name = name;
  }

  if (slug !== undefined) {
    data.slug = slug;
  }

  if (input.description !== undefined) {
    data.description = description ?? null;
  }

  if (!Object.keys(data).length) {
    throw new HttpError("No valid category fields provided", 400);
  }

  return data;
};

const handlePrismaError = (error: unknown): never => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      throw new HttpError("Category slug already exists", 409);
    }

    if (error.code === "P2025") {
      throw new HttpError("Category not found", 404);
    }

    if (error.code === "P2003") {
      throw new HttpError("Category cannot be deleted because it has products", 409);
    }
  }

  throw error;
};

export const categoryService = {
  async getAll() {
    return prisma.category.findMany({
      orderBy: { createdAt: "desc" }
    });
  },

  async create(input: CategoryInput) {
    try {
      return await prisma.category.create({
        data: toCategoryCreateData(input)
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },

  async update(id: string, input: CategoryInput) {
    try {
      return await prisma.category.update({
        where: { id },
        data: toCategoryUpdateData(input)
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },

  async delete(id: string) {
    try {
      await prisma.category.delete({
        where: { id }
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
};
