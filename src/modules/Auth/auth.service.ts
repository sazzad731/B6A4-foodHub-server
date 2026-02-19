import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
const createUser = async (payload: any) => {
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const result = await prisma.user.create({
        data: { ...payload, password: hashedPassword }
    });
    return result
}



export const AuthService = {
    createUser
};