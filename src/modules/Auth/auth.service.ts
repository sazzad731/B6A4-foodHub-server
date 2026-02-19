import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import jwt from "jsonwebtoken"
import config from "../../config";



const createUser = async (payload: any) => {
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const result = await prisma.user.create({
        data: { ...payload, password: hashedPassword }
    });
    return result
}



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



export const AuthService = {
  createUser,
  loginUser,
};