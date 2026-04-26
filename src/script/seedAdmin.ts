import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { UserRole } from "../middlewares/auth";

const seedAdmin = async () => {
  try {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error("ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required");
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const adminData = {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: UserRole.ADMIN,
    };

    const isExist = await prisma.user.findUnique({
      where: {
        email: adminData.email,
      },
    });

    if (isExist) {
      console.log("Admin already exists");
      return;
    }

    await prisma.user.create({
      data: adminData,
    });

    console.log("Admin created successfully");
  } catch (error) {
    console.log(error);
  } finally {
    await prisma.$disconnect();
  }
};

seedAdmin();
