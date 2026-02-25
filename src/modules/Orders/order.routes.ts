import { Router } from "express";
import { orderController } from "./order.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router();


router.post("/",auth(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.PROVIDER), orderController.createOrder)



router.get("/",auth(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.PROVIDER), orderController.getUserOrder)


export const orderRoute = router