import { prisma } from "../../lib/prisma";

const createHttpError = (message: string, statusCode: number) => {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const getAllCategory = async () => {
  const result = await prisma.category.findMany({
    orderBy: [
      { sortOrder: "asc" },
      { name: "asc" },
    ],
    include: {
      _count: {
        select: { meals: true },
      },
    },
  });

  return result.map((category) => ({
    ...category,
    mealCount: category._count.meals,
    _count: undefined,
  }));
};

const addCategory = async (payload: { name: string; slug?: string; image: string; sortOrder?: number }) => {
  if (!payload.name || !payload.image) {
    throw createHttpError("name and image are required", 400);
  }

  const result = await prisma.category.create({
    data: {
      name: payload.name,
      slug: payload.slug || slugify(payload.name),
      image: payload.image,
      sortOrder: Number(payload.sortOrder) || 0,
    },
  });

  return result;
};

const updateCategory = async (
  categoryId: string,
  payload: { name?: string; slug?: string; image?: string; sortOrder?: number },
) => {
  if (
    payload.name === undefined &&
    payload.slug === undefined &&
    payload.image === undefined &&
    payload.sortOrder === undefined
  ) {
    throw createHttpError("No category data provided", 400);
  }

  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    throw createHttpError("Category not found", 404);
  }

  const result = await prisma.category.update({
    where: {
      id: categoryId,
    },
    data: {
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.slug !== undefined
        ? { slug: payload.slug }
        : payload.name !== undefined
          ? { slug: slugify(payload.name) }
          : {}),
      ...(payload.image !== undefined ? { image: payload.image } : {}),
      ...(payload.sortOrder !== undefined ? { sortOrder: Number(payload.sortOrder) } : {}),
    },
  });

  return result;
};

const deleteCategory = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    throw createHttpError("Category not found", 404);
  }

  return prisma.category.delete({
    where: {
      id: categoryId,
    },
  });
};

export const categoryService = {
  getAllCategory,
  addCategory,
  updateCategory,
  deleteCategory,
};
