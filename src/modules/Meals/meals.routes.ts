import { Router } from "express";
import { mealsController } from "./meals.controller";


const router = Router();


router.get("/", mealsController.getAllMeals)


router.get("/:id", mealsController.getMealDetail)


export const mealsRoute = router