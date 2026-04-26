import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { orderController } from "./order.controller";

const router = Router();

router.get("/", auth(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.PROVIDER), orderController.getUserOrder);

router.get("/:id", auth(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.PROVIDER), orderController.getOrderDetails);

router.post("/", auth(UserRole.CUSTOMER), orderController.createOrder);

router.patch("/provider/:id", auth(UserRole.PROVIDER, UserRole.CUSTOMER), orderController.updateOrderStatus);

export const orderRoute = router;
