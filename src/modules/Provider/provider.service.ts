import { prisma } from "../../lib/prisma"
import { UserRole } from "../../middlewares/auth";

const getAllProviders = async () => {
  const result = await prisma.providerProfile.findMany();
  return result;
}




const getProviderById = async (providerId: string) => {
  const result = await prisma.providerProfile.findUniqueOrThrow({
    where: {
      id: providerId
    }
  })

  return result
}





const createProvider = async (payload: any, userId: string) => {
  const result = await prisma.providerProfile.create({
    data: {
      userId,
      ...payload,
    },
  });

  await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      role: UserRole.PROVIDER
    }
  })
  return result;
};





export const providerService = {
  getAllProviders,
  getProviderById,
  createProvider,
};