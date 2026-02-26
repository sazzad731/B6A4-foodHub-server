import { Router } from "express";
import { usersController } from "./users.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router()


router.get("/",auth(UserRole.ADMIN), usersController.getAllUsers)



router.patch("/:id", auth(UserRole.ADMIN), usersController.updateUserStatus)



export const userRoute = router