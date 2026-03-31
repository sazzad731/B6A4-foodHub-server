import { NextFunction, Request, Response } from "express";
import { mealsService } from "./meals.service";
import sendResponse from "../../utils/sendResponse";
import paginationSortingHelper from "../../helpers/paginationSorting";


const getAllMeals = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const { search } = req.query;
    const { price_range } = req.query;
    const searchString = typeof search === "string" ? search : ""
    const [minPrice, maxPrice] = typeof price_range === "string" ? price_range.split(",").length > 1 ? price_range.split(",") : [price_range, "10000"] : ["0", "10000"];
    const { category } = req.query;
    const categoryString = typeof category === "string" ? category : ""

    const {page, skip, limit, sortBy, sortOrder} = paginationSortingHelper(req.query);
    const result = await mealsService.getAllMeals({search: searchString, category: categoryString, minPrice, maxPrice, page, skip, limit, sortBy, sortOrder})
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




const getFeaturedMeals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await mealsService.getFeaturedMeals();
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




const deleteMeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {id} = req.params
    const result = await mealsService.deleteMeal(id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Meal deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};





export const mealsController = {
  getAllMeals,
  getFeaturedMeals,
  getMealDetail,
  addMealToMenu,
  updateMeal,
  deleteMeal,
};