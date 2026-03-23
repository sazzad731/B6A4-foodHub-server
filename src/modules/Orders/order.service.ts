import { OrderStatus } from "../../../generated/prisma/enums"
import { prisma } from "../../lib/prisma"

const createOrder = async (payload: any) => {
  const { customerId, providerId, deliveryAddress, deliveryNote, items } = payload
  
  const mealId = items.map((item: {mealId: string}) => item.mealId);
  const meals = await prisma.meal.findMany({
    where: {id: {in: mealId}}
  })
  
  const orderItems = items.map((item: { mealId: string, quantity: number }) => {
    const meal = meals.find(meal => meal.id === item.mealId);
    if (!meal) throw new Error(`Meal ${item.mealId} is not found`);
    if (!meal.isAvailable)
      throw new Error(`${meal.title} is no longer available`);

    return {
      mealId: meal.id,
      mealName: meal.title,
      image: meal.image,
      unitPrice: meal.price,
      quantity: item.quantity,
      subtotal: meal.price * item.quantity,
    };
  });

  const deliveryFee = await prisma.providerProfile.findUnique({
    where: { id: providerId },
    select: {deliveryFee: true},
  });

  const subtotal: number = orderItems.reduce((sum: number, item: any) => sum + item.subtotal, 0);
  const total: number = subtotal + (deliveryFee?.deliveryFee ? deliveryFee?.deliveryFee : 0);


  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        customerId,
        providerId,
        deliveryAddress,
        deliveryNote,
        subtotal,
        deliveryFee: deliveryFee?.deliveryFee,
        total
      }
    });

    const itemsWithOrderId = orderItems.map((item: any) => ({
      ...item,
      orderId: order.id
    }))

    await tx.orderItem.createMany({
      data: itemsWithOrderId,
    });

    await tx.providerProfile.update({
      where: { id: providerId },
      data: {totalOrders: {increment: 1}}
    })

    return tx.order.findUnique({
      where: { id: order.id },
      include: { items: true },
    });
  })
  return result;
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