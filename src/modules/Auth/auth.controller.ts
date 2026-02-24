import { NextFunction, Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { AuthService } from "./auth.service";
import { JwtPayload } from "jsonwebtoken";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body.role === "ADMIN") {
      throw new Error(
        "Registration failed. You have no permission to use admin role",
      );
    }
    const result = await AuthService.createUser(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User created successfully",
      data: result,
    });
  } catch (error: any) {
    next(error)
  }
};




const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    
    const result = await AuthService.loginUser(email, password);

    res.cookie("token", result.token, {
      secure: false,
      httpOnly: true,
      sameSite: "strict",
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Login success",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};




const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.user?.email;
    const result = await AuthService.getCurrentUser(email as string)
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Data retrieved success",
      data: result,
    });
  } catch (error: any) {
    next(error)
  }
}




export const AuthController = {
  createUser,
  loginUser,
  getCurrentUser,
};
