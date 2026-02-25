import { prisma } from "../../lib/prisma"

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






export const providerService = {
  getAllProviders,
  getProviderById
};