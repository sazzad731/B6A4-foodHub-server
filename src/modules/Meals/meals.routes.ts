import { Router } from "express";
import { mealsController } from "./meals.controller";
import auth, { UserRole } from "../../middlewares/auth";


const router = Router();


router.get("/", mealsController.getAllMeals)


router.get("/:id", mealsController.getMealDetail)



router.post("/provider", auth(UserRole.PROVIDER), mealsController.addMealToMenu)



router.put("/provider/:id", auth(UserRole.PROVIDER), mealsController.updateMeal);


export const mealsRoute = router