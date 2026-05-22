import { NextFunction, Request, Response, Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { orderController } from "./order.controller";

const router = Router();

const createHttpError = (message: string, statusCode: number) => {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
};

const adminOnlyForAdminMount = (req: Request, res: Response, next: NextFunction) => {
  if (req.baseUrl.split("/").includes("admin") && req.user?.role !== UserRole.ADMIN) {
    return next(createHttpError("Only admins can access admin order routes", 403));
  }

  next();
};

const rejectAdminMount = (req: Request, res: Response, next: NextFunction) => {
  if (req.baseUrl.split("/").includes("admin")) {
    return next(createHttpError("This route is not available under admin orders", 403));
  }

  next();
};

router.get(
  "/",
  auth(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.PROVIDER),
  adminOnlyForAdminMount,
  orderController.getUserOrder,
);

router.get(
  "/:id",
  auth(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.PROVIDER),
  adminOnlyForAdminMount,
  orderController.getOrderDetails,
);

router.post("/", rejectAdminMount, auth(UserRole.CUSTOMER), orderController.createOrder);

router.patch(
  "/provider/:id",
  rejectAdminMount,
  auth(UserRole.PROVIDER),
  orderController.updateOrderStatus,
);

export const orderRoute = router;
