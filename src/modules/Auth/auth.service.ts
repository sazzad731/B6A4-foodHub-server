import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import jwt from "jsonwebtoken"
import config from "../../config";
import { UserRole } from "../../middlewares/auth";



const createUser = async (payload: any) => {
  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const { role, name, email, phone, restaurantName, address, image } = payload;

  const customerValue = {
    role,
    name,
    email,
    phone,
  };

  if (payload.role === UserRole.PROVIDER) {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          ...customerValue,
          password: hashedPassword,
        },
      });

      const providerValue = {
        userId: user.id,
        restaurantName,
        phone,
        address,
        image,
      };

      
      await tx.providerProfile.create({
        data: providerValue,
      });

      return user;
    });

    return result;
  }

  const newUser = await prisma.user.create({
    data: { ...customerValue, password: hashedPassword },
  });

  return newUser;
};



const loginUser = async (email: string, password: string) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            email
        }
    })

    if (!user) {
        throw new Error("Account not found, please register first!")
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
        throw new Error("Invalid credentials!!");
    }

    const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
    }

    const token = jwt.sign(userData, config.secret as string, { expiresIn: "1d" })
    
    return {
        token,
        user
    }
}





const getCurrentUser = async (email: string) => {
    const result = await prisma.user.findUniqueOrThrow({
        where: {
            email
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        }
    });
    return result;
};





export const AuthService = {
  createUser,
  loginUser,
  getCurrentUser,
};