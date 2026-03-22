import { Router } from "express";
import { categoryController } from "./category.controller";

const router = Router();


router.get("/get-all", categoryController.getAllCategory)


router.post("/add-one", categoryController.addCategory);


export const categoryRoutes = router