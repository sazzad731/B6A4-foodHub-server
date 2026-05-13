import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middlewares/auth";

const createHttpError = (message: string, statusCode: number) => {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
};

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

const toDecimal = (value: unknown) => new Prisma.Decimal(value as any);

const getAllProviders = async ({
  location,
  page,
  skip,
  limit,
  sortBy,
  sortOrder,
}: {
  location: string;
  page: number;
  skip: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
}) => {
  const result = await prisma.providerProfile.findMany({
    skip,
    take: limit,
    where: {
      address: {
        contains: location,
        mode: "insensitive",
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
          status: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          meals: true,
          orders: true,
        },
      },
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.providerProfile.count({
    where: {
      address: {
        contains: location,
        mode: "insensitive",
      },
    },
  });

  return {
    providers: result.map((provider) => ({
      ...provider,
      mealCount: provider._count.meals,
      orderCount: provider._count.orders,
      _count: undefined,
    })),
    pagination: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const getProviderById = async (providerId: string) => {
  const result = await prisma.providerProfile.findUniqueOrThrow({
    where: {
      id: providerId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
          status: true,
          createdAt: true,
        },
      },
      meals: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          category: {
            select: {
              name: true,
              slug: true,
              image: true,
            },
          },
        },
      },
    },
  });

  return result;
};

const createProvider = async (payload: any, userId: string) => {
  if (!userId) {
    throw createHttpError("User id is required", 400);
  }

  const { cuisineTypes, deliveryFee, ...providerPayload } = payload;
  const existingProvider = await prisma.providerProfile.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
    },
  });
  const hasProviderPayload =
    providerPayload.restaurantName !== undefined ||
    providerPayload.description !== undefined ||
    providerPayload.address !== undefined ||
    providerPayload.phone !== undefined ||
    providerPayload.image !== undefined ||
    deliveryFee !== undefined ||
    cuisineTypes !== undefined;

  if (
    !existingProvider &&
    (!providerPayload.restaurantName ||
      !providerPayload.address ||
      !providerPayload.phone ||
      !providerPayload.image)
  ) {
    throw createHttpError(
      "restaurantName, address, phone and image are required for provider creation",
      400,
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    let provider;

    if (existingProvider) {
      provider = hasProviderPayload
        ? await tx.providerProfile.update({
            where: {
              userId,
            },
            data: {
              ...(providerPayload.restaurantName !== undefined
                ? { restaurantName: providerPayload.restaurantName }
                : {}),
              ...(providerPayload.description !== undefined
                ? { description: providerPayload.description }
                : {}),
              ...(providerPayload.address !== undefined ? { address: providerPayload.address } : {}),
              ...(providerPayload.phone !== undefined ? { phone: providerPayload.phone } : {}),
              ...(providerPayload.image !== undefined ? { image: providerPayload.image } : {}),
              ...(deliveryFee !== undefined && deliveryFee !== null && deliveryFee !== ""
                ? { deliveryFee: toDecimal(deliveryFee) }
                : {}),
              ...(cuisineTypes !== undefined
                ? { cuisineTypes: normalizeStringArray(cuisineTypes) }
                : {}),
            },
          })
        : await tx.providerProfile.findUnique({
            where: {
              userId,
            },
          });
    } else {
      provider = await tx.providerProfile.create({
        data: {
          userId,
          restaurantName: providerPayload.restaurantName,
          description: providerPayload.description || "",
          address: providerPayload.address,
          phone: providerPayload.phone,
          image: providerPayload.image,
          deliveryFee: toDecimal(deliveryFee !== undefined && deliveryFee !== null && deliveryFee !== "" ? deliveryFee : 0),
          cuisineTypes: normalizeStringArray(cuisineTypes),
        },
      });
    }

    await tx.user.update({
      where: {
        id: userId,
      },
      data: {
        role: UserRole.PROVIDER,
      },
    });

    return tx.providerProfile.findUnique({
      where: {
        id: provider?.id ?? existingProvider?.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            status: true,
          },
        },
      },
    });
  });

  return result;
};

const getDashboard = async (userId: string) => {
  const providerProfile = await prisma.providerProfile.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
      totalOrders: true,
      totalRevenue: true,
    },
  });

  if (!providerProfile) {
    throw createHttpError("Provider profile not found", 404);
  }

  const pendingOrders = await prisma.order.count({
    where: {
      items: {
        some: {
          meal: {
            providerId: providerProfile.id,
          },
        },
      },
      status: {
        in: ["PLACED", "PREPARING"],
      },
    },
  });

  const completedOrders = await prisma.order.count({
    where: {
      items: {
        some: {
          meal: {
            providerId: providerProfile.id,
          },
        },
      },
      status: "DELIVERED",
    },
  });

  return {
    totalOrders: providerProfile.totalOrders,
    totalRevenue: providerProfile.totalRevenue,
    pendingOrders,
    completedOrders,
  };
};

export const providerService = {
  getAllProviders,
  getProviderById,
  createProvider,
  getDashboard,
};
