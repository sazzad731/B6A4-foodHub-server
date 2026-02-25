import { Router } from "express";
import { orderController } from "./order.controller";

const router = Router();


router.post("/", orderController.createOrder)


export const orderRoute = router