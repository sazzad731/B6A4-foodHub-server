import { prisma } from "../../lib/prisma"

const getAllCategory = async () => {
  const result = await prisma.mealsCategories.findMany();
  return result;
}



export const categoryService = {
  getAllCategory
}