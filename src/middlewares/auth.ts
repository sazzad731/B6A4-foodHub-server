import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload, Secret } from "jsonwebtoken"
import config from "../config";
import { prisma } from "../lib/prisma";
import { TUser } from ".";


export enum UserRole {
  CUSTOMER = "CUSTOMER",
  PROVIDER = "PROVIDER",
  ADMIN = "ADMIN"
}

const auth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies.token

      if (!token) {
        throw new Error("Token not found")
      }

      const decoded = jwt.verify(token, config.secret as Secret) as TUser;


      const userData = await prisma.user.findUnique({
        where: {
          email: decoded.email
        }
      })


      if (!userData) {
        throw new Error("Unauthorized access!")
      }


      if (userData.status !== "ACTIVE") {
        throw new Error("Unauthorized access!!");
      }


      if (!roles.includes(decoded.role as UserRole)) {
        throw new Error("Unauthorized access!!!");
      }

      req.user = decoded;

      next()
    } catch (error) {
      next(error)
    }
  }
}


export default auth