import { prisma } from "../../lib/prisma"

const getAllCategory = async () => {
  const result = await prisma.mealsCategories.findMany();
  return result;
}



const addCategory = async (payload: {name: string, slug: string}) => {
  const result = await prisma.mealsCategories.create({
    data: {
      ...payload
    }
  })

  return result;
}



export const categoryService = {
  getAllCategory,
  addCategory
}