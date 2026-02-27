import { NextFunction, Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { providerService } from "./provider.service";

const getAllProviders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await providerService.getAllProviders();
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



const getProviderById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {id} = req.params
    const result = await providerService.getProviderById(id as string);
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




const createProvider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const result = await providerService.createProvider(req.body, userId as string);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Provider created successfully",
      data: result,
    });
  } catch (error) {
    next(error)
  }
}




export const providerController = {
  getAllProviders,
  getProviderById,
  createProvider,
};