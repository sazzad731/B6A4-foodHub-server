import { NextFunction, Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { categoryService } from "./category.service";

const getAllCategory = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await categoryService.getAllCategory();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Data retrieved successfully",
      data: result,
    })
  } catch (error) {
    next(error)
  }
}



export const categoryController = {
  getAllCategory
}