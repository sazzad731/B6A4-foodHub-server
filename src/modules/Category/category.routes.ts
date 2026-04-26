import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { categoryController } from "./category.controller";

const router = Router();

router.get("/", categoryController.getAllCategory);

router.get("/get-all", categoryController.getAllCategory);

router.post("/", auth(UserRole.ADMIN), categoryController.addCategory);

router.post("/add-one", auth(UserRole.ADMIN), categoryController.addCategory);

router.patch("/:id", auth(UserRole.ADMIN), categoryController.updateCategory);

router.delete("/:id", auth(UserRole.ADMIN), categoryController.deleteCategory);

export const categoryRoutes = router;
