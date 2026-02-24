import bcrypt from "bcryptjs"
import { prisma } from "../lib/prisma";
import { UserRole } from "../middlewares/auth";

const seedAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD as string, 10);

  const adminData = {
    name: process.env.ADMIN_NAME as string,
    email: process.env.ADMIN_EMAIL as string,
    password: hashedPassword,
    role: UserRole.ADMIN
  };


  const isExist = await prisma.user.findUnique({
    where: {
      email: adminData.email
    }
  })

  if (isExist) {
    console.log("Admin already exist ⚠️");
    return
  }

  await prisma.user.create({
    data: adminData
  })

  console.log("Admin created successfully ✔️");
  } catch (error) {
    console.log(error)
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();