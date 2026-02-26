import { prisma } from "../../lib/prisma"

const getAllMeals = async()=> {
  const result = await prisma.meals.findMany();
  return result
}



const getMealDetail = async (mealId: string) => {
  const result = await prisma.meals.findUniqueOrThrow({
    where: {
      id: mealId
    }
  })

  return result
}



const addMealToMenu = async (payload: any) => {
  const result = await prisma.meals.create({
    data: payload
  })

  return result
}




const updateMeal = async (payload: any, mealId: string, providerId: string) => {
  const result = await prisma.meals.update({
    where: {
      id: mealId,
      providerId
    },
    data: payload
  })

  return result
}





export const mealsService = {
  getAllMeals,
  getMealDetail,
  addMealToMenu,
  updateMeal,
};