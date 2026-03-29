import { prisma } from "../../lib/prisma"
import { UserRole } from "../../middlewares/auth";

const getAllProviders = async ({
  location,
  page,
  skip,
  limit,
  sortBy,
  sortOrder,
}: {
  location: string;
  page: number;
  skip: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
}) => {
  const result = await prisma.providerProfile.findMany({
    skip,
    take: limit,
    where: {
      address: {
        contains: location,
        mode: "insensitive",
      },
    },
    orderBy: {
      [sortBy]: sortOrder
    }
  });

  const total = await prisma.providerProfile.count({
    where: {
      address: {
        contains: location,
        mode: "insensitive",
      },
    },
  });
  return {
    providers: result,
    pagination: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
  };
};




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