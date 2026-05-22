import { NextFunction, Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { orderService } from "./order.service";

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.user?.id;
    const result = await orderService.createOrder(req.body, customerId as string);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Meal ordered successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getUserOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role as string;
    const result = await orderService.getOrders(userId as string, role, req.query);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Order retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getOrderDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role as string;
    const result = await orderService.getOrderDetails(id as string, userId as string, role);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Order retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role as string;
    const result = await orderService.updateOrderStatus(req.body.status, id as string, userId as string, role);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Order status updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const orderController = {
  createOrder,
  getUserOrder,
  getOrderDetails,
  updateOrderStatus,
};
