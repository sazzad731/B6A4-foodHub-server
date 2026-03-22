import { OrderStatus } from "../../../generated/prisma/enums"
import { prisma } from "../../lib/prisma"

const createOrder = async (payload: any) => {
  const result = await prisma.order.create({
    data: payload
  })
  return result
}



const getUserOrder = async (userId: string) => {
  const result = await prisma.order.findMany({
    where: {
      customerId: userId
    },
  });

  return result
}



const getOrderDetails = async (orderId: string, userId: string) => {
  const result = await prisma.order.findUniqueOrThrow({
    where: {
      id: orderId,
      customerId: userId
    }
  })
  return result;
}




const updateOrderStatus = async (status: OrderStatus, orderId: string,) => {
  const result = await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      status
    },
  });

  return result
}




export const orderService = {
  createOrder,
  getUserOrder,
  getOrderDetails,
  updateOrderStatus,
};