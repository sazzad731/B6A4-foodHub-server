import { Router } from "express";
import { categoryController } from "./category.controller";

const router = Router();


router.get("/all", categoryController.getAllCategory)


export const categoryRoutes = router