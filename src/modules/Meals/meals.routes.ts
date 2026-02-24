import { Router } from "express";
import { mealsController } from "./meals.controller";


const router = Router();


router.get("/", mealsController.getAllMeals)


export const mealsRoute = router