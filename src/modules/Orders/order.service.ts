import { prisma } from "../../lib/prisma"

const createOrder = async (payload: any) => {
  const result = await prisma.orders.create({
    data: payload
  })
  return result
}







export const orderService = {
  createOrder
}