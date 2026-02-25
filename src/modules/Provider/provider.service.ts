import { prisma } from "../../lib/prisma"

const getAllProviders = async () => {
  const result = await prisma.providerProfile.findMany();
  return result;
}


export const providerService = {
  getAllProviders
}