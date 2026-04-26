import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { mealsController } from "./meals.controller";

const router = Router();

router.get("/", mealsController.getAllMeals);

router.get("/featured", mealsController.getFeaturedMeals);

router.get("/:id/reviews", mealsController.getMealReviews);

router.get("/:id", mealsController.getMealDetail);

router.post("/:id/reviews", auth(UserRole.CUSTOMER), mealsController.addMealReview);

router.post("/provider", auth(UserRole.PROVIDER), mealsController.addMealToMenu);

router.put("/provider/:id", auth(UserRole.PROVIDER), mealsController.updateMeal);

router.delete("/provider/:id", auth(UserRole.PROVIDER), mealsController.deleteMeal);

export const mealsRoute = router;
