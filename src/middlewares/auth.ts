import { NextFunction, Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import config from "../config";
import { prisma } from "../lib/prisma";
import { TUser } from ".";

export enum UserRole {
  CUSTOMER = "CUSTOMER",
  PROVIDER = "PROVIDER",
  ADMIN = "ADMIN",
}

const createHttpError = (message: string, statusCode: number) => {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
};

const auth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenFromCookie = req.cookies?.token as string | undefined;
      const tokenFromHeader = req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : undefined;
      const token = tokenFromCookie || tokenFromHeader;

      if (!token) {
        throw createHttpError("Token not found", 401);
      }

      const decoded = jwt.verify(token, config.secret as Secret) as TUser;

      const userData = await prisma.user.findUnique({
        where: {
          email: decoded.email,
        },
      });

      if (!userData) {
        throw createHttpError("Unauthorized access!", 401);
      }

      if (userData.status !== "ACTIVE") {
        throw createHttpError("Your account is suspended", 403);
      }

      if (roles.length > 0 && !roles.includes(userData.role as UserRole)) {
        throw createHttpError("Forbidden access", 403);
      }

      req.user = {
        ...decoded,
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        status: userData.status,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
