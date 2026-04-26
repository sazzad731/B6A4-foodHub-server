import { NextFunction, Request, Response } from "express";
import paginationSortingHelper from "../../helpers/paginationSorting";
import sendResponse from "../../utils/sendResponse";
import { mealsService } from "./meals.service";

const getAllMeals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search } = req.query;
    const { price_range, minPrice: queryMinPrice, maxPrice: queryMaxPrice } = req.query;
    const searchString = typeof search === "string" ? search : "";
    const categoryQuery =
      typeof req.query.category === "string"
        ? req.query.category
        : typeof req.query.cuisine === "string"
          ? req.query.cuisine
          : typeof req.query.cuisineType === "string"
            ? req.query.cuisineType
            : "";
    const dietaryPreference =
      typeof req.query.dietary === "string"
        ? req.query.dietary
        : typeof req.query.dietaryPreference === "string"
          ? req.query.dietaryPreference
          : typeof req.query.isVegan === "string"
            ? req.query.isVegan
            : "";

    const priceRangeValue = typeof price_range === "string" ? price_range : "";
    const [minPrice, maxPrice] =
      priceRangeValue && priceRangeValue.split(",").length > 1
        ? priceRangeValue.split(",")
        : [
            typeof queryMinPrice === "string" ? queryMinPrice : "0",
            typeof queryMaxPrice === "string" ? queryMaxPrice : "10000",
          ];

    const { page, skip, limit, sortBy, sortOrder } = paginationSortingHelper(req.query);
    const result = await mealsService.getAllMeals({
      search: searchString,
      category: categoryQuery,
      dietaryPreference,
      minPrice,
      maxPrice,
      page,
      skip,
      limit,
      sortBy,
      sortOrder,
    });
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
    const { id } = req.params;
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

const getMealReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await mealsService.getMealReviews(id as string);
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
    const providerUserId = req.user?.id;
    const result = await mealsService.addMealToMenu(req.body, providerUserId as string);
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
    const { id } = req.params;
    const providerUserId = req.user?.id as string;
    const role = req.user?.role as string;
    const result = await mealsService.updateMeal(req.body, id as string, providerUserId, role);
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
    const { id } = req.params;
    const providerUserId = req.user?.id as string;
    const role = req.user?.role as string;
    const result = await mealsService.deleteMeal(id as string, providerUserId, role);
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

const addMealReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const customerId = req.user?.id as string;
    const result = await mealsService.addMealReview(id as string, customerId, req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Review submitted successfully",
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
  getMealReviews,
  addMealToMenu,
  updateMeal,
  deleteMeal,
  addMealReview,
};
