import { Prisma } from "../../../generated/prisma/client.js";
import { Status } from "../../../generated/prisma/enums.js";
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
  role: true,
  status: true,
  phone: true,
  address: true,
  image: true,
  createdAt: true,
  updatedAt: true,
  providerProfile: {
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
      createdAt: true,
      updatedAt: true,
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

const getAllUsers = async () => {
  const result = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: safeUserSelect,
  });
  return result;
};

const updateUserStatus = async (status: Status, userId: string) => {
  if (!status) {
    throw createHttpError("status is required", 400);
  }

  if (!Object.values(Status).includes(status)) {
    throw createHttpError("Invalid user status", 400);
  }

  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status,
    },
    select: safeUserSelect,
  });
  return result;
};

const updateOwnProfile = async (userId: string, role: string, payload: any) => {
  const { name, phone, address, image, restaurantName, description, deliveryFee, cuisineTypes, isOpen } = payload;

  const userData: Record<string, unknown> = {};
  if (name !== undefined) userData.name = name;
  if (phone !== undefined) userData.phone = phone;
  if (address !== undefined) userData.address = address;
  if (image !== undefined) userData.image = image;

  const providerData: Record<string, unknown> = {};
  if (role === UserRole.PROVIDER) {
    if (restaurantName !== undefined) providerData.restaurantName = restaurantName;
    if (description !== undefined) providerData.description = description;
    if (deliveryFee !== undefined && deliveryFee !== null && deliveryFee !== "") {
      providerData.deliveryFee = toDecimal(deliveryFee);
    }
    if (cuisineTypes !== undefined) providerData.cuisineTypes = normalizeStringArray(cuisineTypes);
    if (isOpen !== undefined) providerData.isOpen = parseBoolean(isOpen);
    if (phone !== undefined) providerData.phone = phone;
    if (address !== undefined) providerData.address = address;
    if (image !== undefined) providerData.image = image;
  }

  if (!Object.keys(userData).length && !Object.keys(providerData).length) {
    throw createHttpError("No profile data provided", 400);
  }

  return prisma.$transaction(async (tx) => {
    let updatedUser = await tx.user.findUnique({
      where: {
        id: userId,
      },
      select: safeUserSelect,
    });

    if (!updatedUser) {
      throw createHttpError("User not found", 404);
    }

    if (Object.keys(userData).length) {
      updatedUser = await tx.user.update({
        where: {
          id: userId,
        },
        data: userData,
        select: safeUserSelect,
      });
    }

    if (role === UserRole.PROVIDER && Object.keys(providerData).length) {
      await tx.providerProfile.update({
        where: {
          userId,
        },
        data: providerData,
      });
    }

    return tx.user.findUnique({
      where: {
        id: updatedUser.id,
      },
      select: safeUserSelect,
    });
  });
};

export const usersService = {
  getAllUsers,
  updateUserStatus,
  updateOwnProfile,
};
