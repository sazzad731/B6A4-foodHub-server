import { prisma } from "../../lib/prisma"

const getAllCategory = async () => {
  const result = await prisma.category.findMany({
    include: {
      _count: {
        select: {meals: true}
      }
    }
  });
  const categoriesWithCount = result.map((category) => ({
    ...category,
    mealCount: category._count.meals,
    _count: undefined,
  }));
  return categoriesWithCount;
}



const addCategory = async (payload: {name: string, slug: string, image: string}) => {
  const result = await prisma.category.create({
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