import { NextFunction, Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { usersService } from "./users.service";

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await usersService.getAllUsers();
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



export const usersController = {
  getAllUsers
}