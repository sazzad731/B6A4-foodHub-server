import { Router } from "express";
import { orderController } from "./order.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router();


router.get("/",auth(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.PROVIDER), orderController.getUserOrder)



router.get("/:id", auth(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.PROVIDER), orderController.getOrderDetails);



router.post("/", auth(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.PROVIDER), orderController.createOrder)



router.patch("/provider/:id", auth(UserRole.PROVIDER, UserRole.CUSTOMER), orderController.updateOrderStatus)


export const orderRoute = router