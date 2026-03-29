import { MealWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma"

const getAllMeals = async ({
  search,
  minPrice,
  maxPrice,
  page,
  skip,
  limit,
  sortBy,
  sortOrder
}: {
  search: string;
  minPrice: string;
  maxPrice: string;
  page: number;
  skip: number;
  limit: number;
  sortBy: string,
  sortOrder: string
}) => {
  const andCondition: MealWhereInput[] = [
    {
      OR: [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          tags: {
            has: search,
          },
        },
        {
          category: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          provider: {
            OR: [
              {
                restaurantName: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                address: {
                  contains: search,
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
        gte: Number(minPrice),
        lte: Number(maxPrice),
      },
    },
  ];
  const result = await prisma.meal.findMany({
    skip,
    take: limit,
    where: {
      AND: andCondition,
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
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.meal.count({
    where: {
      AND: andCondition
    }
  })
  return {
    meals: result,
    pagination: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total/limit)
    }
  };
};



const getFeaturedMeals = async () => {
  const result = await prisma.meal.findMany({
    where: {
      isAvailable: true,
      avgRating: {
        gte: 4.5,
      },
      reviewCount: {
        gte: 4.5,
      },
    },
    orderBy: [{ avgRating: "desc" }, { reviewCount: "desc" }],
    take: 6,
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
}



const getMealDetail = async (mealId: string) => {
  const result = await prisma.meal.findUniqueOrThrow({
    where: {
      id: mealId
    },
    include: {
      provider: {
        select: {
          restaurantName: true,
          deliveryFee: true,
          image: true,
          isOpen: true,
          address: true
        }
      },
      category: true,
      reviews: {
        include: {
          customer: {
            select: {
              name: true,
              email: true,
              image: true
            }
          }
        }
      }
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
  getFeaturedMeals,
  getMealDetail,
  addMealToMenu,
  updateMeal,
  deleteMeal,
};