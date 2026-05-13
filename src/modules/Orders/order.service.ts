import { Prisma } from "../../../generated/prisma/client.js";
import { OrderStatus } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middlewares/auth";

const createHttpError = (message: string, statusCode: number) => {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
};

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  image: true,
  role: true,
  status: true,
} as const;

const orderInclude = {
  items: {
    include: {
      meal: {
        select: {
          id: true,
          title: true,
          image: true,
          price: true,
        },
      },
    },
  },
  customer: {
    select: safeUserSelect,
  },
  provider: {
    select: {
      id: true,
      restaurantName: true,
      address: true,
      phone: true,
      image: true,
      deliveryFee: true,
      isOpen: true,
      avgRating: true,
      totalOrders: true,
      totalRevenue: true,
    },
  },
} as const;

const toDecimal = (value: unknown) => new Prisma.Decimal(value as any);

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  PLACED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  PREPARING: [OrderStatus.READY],
  READY: [OrderStatus.DELIVERED],
  DELIVERED: [],
  CANCELLED: [],
};

const resolveProviderByUserId = async (userId: string) => {
  const providerProfile = await prisma.providerProfile.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!providerProfile) {
    throw createHttpError("Provider profile not found", 404);
  }

  return providerProfile;
};

const getAccessibleOrderWhere = async (userId: string, role: string, orderId?: string) => {
  if (role === UserRole.ADMIN) {
    return orderId ? { id: orderId } : {};
  }

  if (role === UserRole.PROVIDER) {
    const provider = await resolveProviderByUserId(userId);
    const providerOrderWhere = {
      items: {
        some: {
          meal: {
            providerId: provider.id,
          },
        },
      },
    };
    return orderId
      ? {
          id: orderId,
          ...providerOrderWhere,
        }
      : providerOrderWhere;
  }

  if (role === UserRole.CUSTOMER) {
    return orderId
      ? {
          id: orderId,
          customerId: userId,
        }
      : {
          customerId: userId,
        };
  }

  throw createHttpError("Unauthorized access!", 401);
};

const createOrder = async (payload: any, customerId: string) => {
  const { deliveryAddress, phone: deliveryPhone, deliveryNote, items } = payload;

  if (!customerId) {
    throw createHttpError("Customer id is required", 400);
  }

  const normalizedDeliveryAddress =
    typeof deliveryAddress === "string" ? deliveryAddress.trim() : "";

  if (!normalizedDeliveryAddress) {
    throw createHttpError("deliveryAddress is required", 400);
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw createHttpError("At least one order item is required", 400);
  }

  const customer = await prisma.user.findUnique({
    where: {
      id: customerId,
    },
    select: {
      phone: true,
    },
  });

  const phone =
    typeof deliveryPhone === "string" && deliveryPhone.trim()
      ? deliveryPhone.trim()
      : customer?.phone?.trim();

  if (!phone) {
    throw createHttpError("phone is required", 400);
  }

  const normalizedItems = items.map((item: any, index: number) => {
    const mealId = typeof item?.mealId === "string" ? item.mealId.trim() : "";
    const quantity = Number(item?.quantity);

    if (!mealId) {
      throw createHttpError(`mealId is required for order item ${index + 1}`, 400);
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw createHttpError(`Quantity must be at least 1 for order item ${index + 1}`, 400);
    }

    return {
      mealId,
      quantity,
    };
  });

  const mealIds = normalizedItems.map((item) => item.mealId);
  const uniqueMealIds = [...new Set(mealIds)];

  const meals = await prisma.meal.findMany({
    where: {
      id: {
        in: uniqueMealIds,
      },
      isAvailable: true,
    },
  });

  if (meals.length !== uniqueMealIds.length) {
    throw createHttpError("One or more meals were not found or are unavailable", 404);
  }

  const providerId = meals[0].providerId;
  const allMealsFromSameProvider = meals.every((meal) => meal.providerId === providerId);

  if (!allMealsFromSameProvider) {
    throw createHttpError("All ordered meals must belong to the same provider", 400);
  }

  const providerProfile = await prisma.providerProfile.findUnique({
    where: {
      id: providerId,
    },
    select: {
      id: true,
      deliveryFee: true,
    },
  });

  if (!providerProfile) {
    throw createHttpError("Provider profile not found", 404);
  }

  const orderItems = normalizedItems.map((item) => {
    const meal = meals.find((entry) => entry.id === item.mealId);

    if (!meal) {
      throw createHttpError(`Meal ${item.mealId} is not found`, 404);
    }

    const priceAtOrder = toDecimal(meal.price);
    const itemSubtotal = priceAtOrder.mul(item.quantity);

    return {
      mealId: meal.id,
      mealName: meal.title,
      image: meal.image,
      priceAtOrder,
      quantity: item.quantity,
      subtotal: itemSubtotal,
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum.add(item.subtotal), toDecimal(0));
  const deliveryFee = toDecimal(providerProfile.deliveryFee);
  const totalPrice = subtotal.add(deliveryFee);

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
      customerId,
      providerId,
      deliveryAddress: normalizedDeliveryAddress,
      phone,
      deliveryNote,
      subtotal,
        deliveryFee,
        totalPrice,
      },
    });

    await tx.orderItem.createMany({
      data: orderItems.map((item) => ({
        ...item,
        orderId: order.id,
      })),
    });

    await tx.providerProfile.update({
      where: {
        id: providerId,
      },
      data: {
        totalOrders: {
          increment: 1,
        },
        totalRevenue: {
          increment: totalPrice,
        },
      },
    });

    return tx.order.findUnique({
      where: {
        id: order.id,
      },
      include: orderInclude,
    });
  });

  return result;
};

const getOrders = async (userId: string, role: string) => {
  const where = await getAccessibleOrderWhere(userId, role);

  const result = await prisma.order.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    include: orderInclude,
  });

  return result;
};

const getOrderDetails = async (orderId: string, userId: string, role: string) => {
  const where = await getAccessibleOrderWhere(userId, role, orderId);

  const result = await prisma.order.findFirstOrThrow({
    where,
    include: orderInclude,
  });

  return result;
};

const updateOrderStatus = async (status: OrderStatus, orderId: string, userId: string, role: string) => {
  if (!status) {
    throw createHttpError("status not found", 400);
  }

  if (!Object.values(OrderStatus).includes(status)) {
    throw createHttpError("Invalid order status", 400);
  }

  if (role !== UserRole.PROVIDER) {
    throw createHttpError("Only providers can update order status", 403);
  }

  const where = await getAccessibleOrderWhere(userId, role, orderId);

  const order = await prisma.order.findFirstOrThrow({
    where,
    select: {
      id: true,
      status: true,
    },
  });

  if (order.status === status) {
    throw createHttpError("Invalid order status transition", 400);
  }

  const allowedNextStatuses = allowedTransitions[order.status];

  if (!allowedNextStatuses.includes(status)) {
    throw createHttpError("Invalid order status transition", 400);
  }

  const result = await prisma.order.update({
    where: {
      id: order.id,
    },
    data: {
      status,
    },
    include: orderInclude,
  });

  return result;
};

export const orderService = {
  createOrder,
  getOrders,
  getOrderDetails,
  updateOrderStatus,
};
