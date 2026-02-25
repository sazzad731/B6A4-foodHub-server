import { NextFunction, Request, Response } from "express";
import { mealsService } from "./meals.service";
import sendResponse from "../../utils/sendResponse";


const getAllMeals = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await mealsService.getAllMeals()
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Data retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error)
  }
}



const getMealDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {id} = req.params
    const result = await mealsService.getMealDetail(id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Data retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};



export const mealsController = {
  getAllMeals,
  getMealDetail,
};