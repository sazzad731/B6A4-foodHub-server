import { prisma } from "../../lib/prisma"

const getAllMeals = async()=> {
  const result = await prisma.meals.findMany();
  return result
}



export const mealsService = {
  getAllMeals
}