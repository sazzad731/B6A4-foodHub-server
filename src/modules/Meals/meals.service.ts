import { prisma } from "../../lib/prisma"

const getAllMeals = async (payload: {
  search: string;
  minPrice: string;
  maxPrice: string;
}) => {
  const result = await prisma.meal.findMany({
    where: {
      AND: [
        {
          OR: [
            {
              title: {
                contains: payload.search,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: payload.search,
                mode: "insensitive",
              },
            },
            {
              tags: {
                has: payload.search,
              },
            },
            {
              category: {
                name: {
                  contains: payload.search,
                  mode: "insensitive",
                },
              },
            },
            {
              provider: {
                OR: [
                  {
                    restaurantName: {
                      contains: payload.search,
                      mode: "insensitive",
                    },
                  },
                  {
                    address: {
                      contains: payload.search,
                      mode: "insensitive",
                    },
                  },
                ],
              },
            },
          ],
        },
        {
          price: {
            gte: Number(payload.minPrice),
            lte: Number(payload.maxPrice),
          },
        },
      ],
    },
    include: {
      provider: {
        select: {
          restaurantName: true,
          image: true,
          address: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
    },
  });
  return result;
};



const getMealDetail = async (mealId: string) => {
  const result = await prisma.meal.findUniqueOrThrow({
    where: {
      id: mealId
    }
  })

  return result
}



const addMealToMenu = async (payload: any) => {
  const result = await prisma.meal.create({
    data: payload
  })

  return result
}




const updateMeal = async (payload: any, mealId: string, providerId: string) => {
  const result = await prisma.meal.update({
    where: {
      id: mealId,
      providerId
    },
    data: payload
  })

  return result
}




const deleteMeal = async (mealId: string) => {
  return await prisma.meal.delete({
    where: {
      id: mealId
    }
  })
}





export const mealsService = {
  getAllMeals,
  getMealDetail,
  addMealToMenu,
  updateMeal,
  deleteMeal,
};