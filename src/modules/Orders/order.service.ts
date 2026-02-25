import { prisma } from "../../lib/prisma"

const createOrder = async (payload: any) => {
  const result = await prisma.orders.create({
    data: payload
  })
  return result
}



const getUserOrder = async (userId: string) => {
  const result = await prisma.orders.findMany({
    where: {
      customerId: userId
    },
  });

  return result
}



const getOrderDetails = async (orderId: string, userId: string) => {
  const result = await prisma.orders.findUniqueOrThrow({
    where: {
      id: orderId,
      customerId: userId
    }
  })
  return result;
}




export const orderService = {
  createOrder,
  getUserOrder,
  getOrderDetails,
};