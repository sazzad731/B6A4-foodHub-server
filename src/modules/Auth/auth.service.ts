import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Prisma } from "../../../generated/prisma/client.js";
import config from "../../config";
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

const getSafeUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
    select: safeUserSelect,
  });
};

const getSafeUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: {
      id,
    },
    select: safeUserSelect,
  });
};

const createUser = async (payload: any) => {
  const { role = UserRole.CUSTOMER, name, email, password, phone, restaurantName, address, image, cuisineTypes, description, deliveryFee } = payload;

  if (!name || !email || !password) {
    throw createHttpError("Name, email and password are required", 400);
  }

  if (![UserRole.CUSTOMER, UserRole.PROVIDER].includes(role)) {
    throw createHttpError("Invalid user role", 400);
  }

  if (role === UserRole.PROVIDER && (!restaurantName || !address || !phone || !image)) {
    throw createHttpError(
      "Restaurant name, address, phone and image are required for provider registration",
      400,
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        role,
        name,
        email,
        phone: phone || null,
        address: address || null,
        image: image || null,
        password: hashedPassword,
      },
    });

    if (role === UserRole.PROVIDER) {
      await tx.providerProfile.create({
        data: {
          userId: user.id,
          restaurantName,
          description: description || "",
          address,
          phone,
          image,
          deliveryFee: toDecimal(
            deliveryFee !== undefined && deliveryFee !== null && deliveryFee !== "" ? deliveryFee : 0,
          ),
          cuisineTypes: normalizeStringArray(cuisineTypes),
        },
      });
    }

    return tx.user.findUnique({
      where: {
        id: user.id,
      },
      select: safeUserSelect,
    });
  });

  return result;
};

const loginUser = async (email: string, password: string) => {
  if (!email || !password) {
    throw createHttpError("Email and password are required", 400);
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      ...safeUserSelect,
      password: true,
    },
  });

  if (!user) {
    throw createHttpError("Account not found, please register first!", 404);
  }

  if (user.status !== "ACTIVE") {
    throw createHttpError("Your account is suspended", 403);
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    throw createHttpError("Invalid credentials!!", 401);
  }

  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    config.secret as string,
    { expiresIn: "1d" },
  );

  const { password: _password, ...safeUser } = user;

  return {
    token,
    user: safeUser,
  };
};

const getCurrentUser = async (email: string) => {
  if (!email) {
    throw createHttpError("Email is required", 400);
  }

  const result = await getSafeUserByEmail(email);

  if (!result) {
    throw createHttpError("User not found", 404);
  }

  return result;
};

const getCurrentUserById = async (id: string) => {
  if (!id) {
    throw createHttpError("User id is required", 400);
  }

  const result = await getSafeUserById(id);

  if (!result) {
    throw createHttpError("User not found", 404);
  }

  return result;
};

export const AuthService = {
  createUser,
  loginUser,
  getCurrentUser,
  getCurrentUserById,
};
