import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {

  let statusCode = 500;
  let message = "Internal server error!!"
  let errorDetails = err

  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "You provided incorrect field type or missing field";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      statusCode = 400;
      message =
        "An operation failed because it depends on one or more records that were required but not found.";
    } else if (err.code === "P2002") {
      statusCode = 400;
      message = "Duplicate key error";
    } else if (err.code === "P2003") {
      statusCode = 400;
      message = "Foreign key constraint failed";
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    message = "Error occurred during query execution";
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = 401
      message = "Authentication failed against database server at {database_host}, the provided database credentials for {database_user} are not valid. Please make sure to provide valid database credentials for the database server at {database_host}."
    }
  } else if (err.message === "Unauthorized access!!!" || err.message === "Unauthorized access!" || err.message === "Unauthorized access!!") {
    statusCode = 401
    message = "You are not authorized"
    errorDetails = err.message;
  } else {
    errorDetails = err.message;
  }

  res.status(statusCode);
  res.json({
    success: false,
    message,
    error: errorDetails
  })
}