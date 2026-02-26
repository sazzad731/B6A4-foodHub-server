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




const addMealToMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await mealsService.addMealToMenu(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Meal added successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};




const updateMeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { providerId } = req.body;
    if(!providerId){
      throw new Error("providerId is required")
    }
    const result = await mealsService.updateMeal(req.body, id as string, providerId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Meal updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};




export const mealsController = {
  getAllMeals,
  getMealDetail,
  addMealToMenu,
  updateMeal,
};