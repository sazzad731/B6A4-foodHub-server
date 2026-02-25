import { NextFunction, Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { orderService } from "./order.service";

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await orderService.createOrder(req.body)
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Meal ordered successfully",
      data: result,
    });
  } catch (error) {
    next(error)
  }
}


export const orderController = {
  createOrder
}