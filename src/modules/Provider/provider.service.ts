import { prisma } from "../../lib/prisma"
import { UserRole } from "../../middlewares/auth";

const getAllProviders = async (payload: {location: string}) => {
  const { location } = payload;
  const result = await prisma.providerProfile.findMany({
    where: {
      address: {
        contains: location,
        mode: "insensitive"
      }
    }
  });
  return result;
}




const getProviderById = async (providerId: string) => {
  const result = await prisma.providerProfile.findUniqueOrThrow({
    where: {
      id: providerId,
    },
    include: {
      meals: {
        include: {
          category: {
            select: {
              name: true,
              slug: true,
              image: true,
            },
          },
        },
      },
    },
  });

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