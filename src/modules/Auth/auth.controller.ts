import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { AuthService } from "./auth.service";

const createUser = async (req: Request, res: Response) => {
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
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "User creation failed",
      data: error.message,
    });
  }
};




const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
      const result = await AuthService.loginUser(email, password);
      

      res.cookie("token", result.token, {
          secure: false,
          httpOnly: true,
          sameSite: "strict"
      })


    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Login success",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Login failed",
      data: error.message,
    });
  }
};

export const AuthController = {
  createUser,
  loginUser,
};
