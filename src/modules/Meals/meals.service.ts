import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma";

const createHttpError = (message: string, statusCode: number) => {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
};

const toDecimal = (value: unknown) => new Prisma.Decimal(value as any);

const parseBoolean = (value: unknown) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (["true", "1", "yes", "on"].includes(normalized)) {
      return true;
    }

    if (["false", "0", "no", "off"].includes(normalized)) {
      return false;
    }
  }

  return Boolean(value);
};

const mealInclude = {
  provider: {
    select: {
      id: true,
      restaurantName: true,
      description: true,
      address: true,
      phone: true,
      image: true,
      deliveryFee: true,
      isOpen: true,
      cuisineTypes: true,
      avgRating: true,
      totalOrders: true,
      totalRevenue: true,
    },
  },
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
    },
  },
} as const;

const mealDetailInclude = {
  ...mealInclude,
  reviews: {
    orderBy: {
      createdAt: "desc",
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      order: {
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
      },
    },
  },
} as const;

const normalizeStringArray = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const resolveCategoryIds = async (category: string) => {
  if (!category) {
    return [];
  }

  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { id: category },
        { slug: { equals: category, mode: "insensitive" } },
        { name: { equals: category, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
    },
  });

  return categories.map((item) => item.id);
};

const resolveProviderProfile = async (userId: string) => {
  const providerProfile = await prisma.providerProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!providerProfile) {
    throw createHttpError("Provider profile not found", 404);
  }

  return providerProfile;
};

const recalculateMealAndProviderRatings = async (tx: any, mealId: string, providerId: string) => {
  const mealStats = await tx.review.aggregate({
    where: {
      mealId,
    },
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  });

  await tx.meal.update({
    where: {
      id: mealId,
    },
    data: {
      avgRating: mealStats._avg.rating ?? 0,
      reviewCount: mealStats._count.rating,
    },
  });

  const providerStats = await tx.review.aggregate({
    where: {
      meal: {
        providerId,
      },
    },
    _avg: {
      rating: true,
    },
  });

  await tx.providerProfile.update({
    where: {
      id: providerId,
    },
    data: {
      avgRating: providerStats._avg.rating ?? 0,
    },
  });
};

const getAllMeals = async ({
  search,
  category,
  dietaryPreference,
  minPrice,
  maxPrice,
  page,
  skip,
  limit,
  sortBy,
  sortOrder,
}: {
  search: string;
  category: string;
  dietaryPreference: string;
  minPrice: string;
  maxPrice: string;
  page: number;
  skip: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
}) => {
  const andCondition: any[] = [
    {
      isAvailable: true,
    },
  ];

  if (search) {
    andCondition.push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
        {
          provider: {
            OR: [
              { restaurantName: { contains: search, mode: "insensitive" } },
              { address: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ],
    });
  }

  if (category) {
    const categoryIds = await resolveCategoryIds(category);
    if (categoryIds.length === 0) {
      return {
        meals: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPage: 0,
        },
      };
    }

    andCondition.push({
      categoryId: {
        in: categoryIds,
      },
    });
  }

  const normalizedDietary = dietaryPreference.trim().toLowerCase();
  if (normalizedDietary) {
    const isVegan =
      normalizedDietary === "vegan" ||
      normalizedDietary === "true" ||
      normalizedDietary === "1" ||
      normalizedDietary === "yes";

    if (isVegan) {
      andCondition.push({
        isVegan: true,
      });
    }
  }

  if (minPrice || maxPrice) {
    andCondition.push({
      price: {
        gte: minPrice ? toDecimal(minPrice) : toDecimal(0),
        lte: maxPrice ? toDecimal(maxPrice) : toDecimal(1000000),
      },
    });
  }

  const result = await prisma.meal.findMany({
    skip,
    take: limit,
    where: {
      AND: andCondition,
    },
    include: mealInclude,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.meal.count({
    where: {
      AND: andCondition,
    },
  });

  return {
    meals: result,
    pagination: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const getFeaturedMeals = async () => {
  const result = await prisma.meal.findMany({
    where: {
      isAvailable: true,
    },
    orderBy: [{ avgRating: "desc" }, { reviewCount: "desc" }, { createdAt: "desc" }],
    take: 6,
    include: mealInclude,
  });
  return result;
};

const getMealDetail = async (mealId: string) => {
  const result = await prisma.meal.findUniqueOrThrow({
    where: {
      id: mealId,
    },
    include: mealDetailInclude,
  });

  return result;
};

const getMealReviews = async (mealId: string) => {
  const meal = await prisma.meal.findUnique({
    where: {
      id: mealId,
    },
    select: {
      id: true,
      title: true,
    },
  });

  if (!meal) {
    throw createHttpError("Meal not found", 404);
  }

  const reviews = await prisma.review.findMany({
    where: {
      mealId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      order: {
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  return {
    meal,
    reviews,
  };
};

const addMealToMenu = async (payload: any, providerUserId: string) => {
  const providerProfile = await resolveProviderProfile(providerUserId);
  const { providerId: _ignoredProviderId, tags, categoryId, ...mealData } = payload;
  const normalizedPrice = typeof mealData.price === "string" ? mealData.price.trim() : mealData.price;

  if (
    !mealData.title ||
    !categoryId ||
    normalizedPrice === undefined ||
    normalizedPrice === null ||
    normalizedPrice === "" ||
    !mealData.image
  ) {
    throw createHttpError("title, categoryId, price and image are required", 400);
  }

  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    throw createHttpError("Category not found", 404);
  }

  const result = await prisma.meal.create({
    data: {
      providerId: providerProfile.id,
      categoryId,
      title: mealData.title,
      description: mealData.description || "",
      price: toDecimal(normalizedPrice),
      image: mealData.image,
      prepTime: Number(mealData.prepTime) || 20,
      isAvailable:
        mealData.isAvailable === undefined ? true : parseBoolean(mealData.isAvailable),
      isVegan: mealData.isVegan === undefined ? false : parseBoolean(mealData.isVegan),
      tags: normalizeStringArray(tags),
    },
    include: mealInclude,
  });

  return result;
};

const updateMeal = async (payload: any, mealId: string, providerUserId: string, role: string) => {
  const { providerId: _ignoredProviderId, tags, categoryId, ...mealData } = payload;
  const normalizedPrice = typeof mealData.price === "string" ? mealData.price.trim() : mealData.price;

  if (
    mealData.title === undefined &&
    mealData.description === undefined &&
    (normalizedPrice === undefined || normalizedPrice === "") &&
    mealData.image === undefined &&
    mealData.prepTime === undefined &&
    mealData.isAvailable === undefined &&
    mealData.isVegan === undefined &&
    categoryId === undefined &&
    tags === undefined
  ) {
    throw createHttpError("No meal data provided", 400);
  }

  await resolveProviderProfile(providerUserId);
  const meal = await prisma.meal.findUnique({
    where: {
      id: mealId,
    },
    select: {
      id: true,
      provider: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!meal) {
    throw createHttpError("Meal not found", 404);
  }

  if (meal.provider.userId !== providerUserId) {
    throw createHttpError("You can only update your own meals", 403);
  }

  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      throw createHttpError("Category not found", 404);
    }
  }

  const result = await prisma.meal.update({
    where: {
      id: mealId,
    },
    data: {
      ...(mealData.title !== undefined ? { title: mealData.title } : {}),
      ...(mealData.description !== undefined ? { description: mealData.description } : {}),
      ...(normalizedPrice !== undefined ? { price: toDecimal(normalizedPrice) } : {}),
      ...(mealData.image !== undefined ? { image: mealData.image } : {}),
      ...(mealData.prepTime !== undefined ? { prepTime: Number(mealData.prepTime) } : {}),
      ...(mealData.isAvailable !== undefined
        ? { isAvailable: parseBoolean(mealData.isAvailable) }
        : {}),
      ...(mealData.isVegan !== undefined ? { isVegan: parseBoolean(mealData.isVegan) } : {}),
      ...(categoryId !== undefined ? { categoryId } : {}),
      ...(tags !== undefined ? { tags: normalizeStringArray(tags) } : {}),
    },
    include: mealInclude,
  });

  return result;
};

const deleteMeal = async (mealId: string, providerUserId: string, role: string) => {
  await resolveProviderProfile(providerUserId);
  const meal = await prisma.meal.findUnique({
    where: {
      id: mealId,
    },
    select: {
      id: true,
      provider: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!meal) {
    throw createHttpError("Meal not found", 404);
  }

  if (meal.provider.userId !== providerUserId) {
    throw createHttpError("You can only delete your own meals", 403);
  }

  return prisma.meal.delete({
    where: {
      id: mealId,
    },
    include: mealInclude,
  });
};

const addMealReview = async (mealId: string, customerId: string, payload: any) => {
  const rating = Number(payload.rating);
  const comment = typeof payload.comment === "string" ? payload.comment.trim() : "";

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw createHttpError("rating must be an integer between 1 and 5", 400);
  }

  const meal = await prisma.meal.findUnique({
    where: {
      id: mealId,
    },
    select: {
      id: true,
      providerId: true,
    },
  });

  if (!meal) {
    throw createHttpError("Meal not found", 404);
  }

  const order = await prisma.order.findFirst({
    where: {
      customerId,
      status: {
        not: "CANCELLED",
      },
      items: {
        some: {
          mealId,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
    },
  });

  if (!order) {
    throw createHttpError("You can review this meal only after placing an order", 403);
  }

  return prisma.$transaction(async (tx) => {
    const review = await tx.review.upsert({
      where: {
        customerId_mealId: {
          customerId,
          mealId,
        },
      },
      create: {
        customerId,
        mealId,
        orderId: order.id,
        rating,
        comment,
      },
      update: {
        orderId: order.id,
        rating,
        comment,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        order: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    await recalculateMealAndProviderRatings(tx, mealId, meal.providerId);

    return review;
  });
};

export const mealsService = {
  getAllMeals,
  getFeaturedMeals,
  getMealDetail,
  getMealReviews,
  addMealToMenu,
  updateMeal,
  deleteMeal,
  addMealReview,
};
