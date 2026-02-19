import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { AuthService } from "./auth.service";

const createUser = async (req: Request, res: Response) => {
    try {
        const result = await AuthService.createUser(req.body)
        sendResponse(res, {
          statusCode: 201,
          success: true,
          message: "User created successfully",
          data: result,
        });
    } catch (error) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "User creation failed"
        })
    }
}



export const AuthController = {
  createUser,
};