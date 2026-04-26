import { NextFunction, Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { categoryService } from "./category.service";

const getAllCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await categoryService.getAllCategory();
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

const addCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = req.body;
    const result = await categoryService.addCategory(category);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Category created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await categoryService.updateCategory(id as string, req.body);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Category updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await categoryService.deleteCategory(id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Category deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const categoryController = {
  getAllCategory,
  addCategory,
  updateCategory,
  deleteCategory,
};
