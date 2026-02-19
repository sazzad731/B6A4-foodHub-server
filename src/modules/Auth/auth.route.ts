import express from 'express';
import { AuthController } from './auth.controller';

const router = express.Router();



router.use("/register", AuthController.createUser);



router.use("/login", AuthController.loginUser);




export const AuthRoutes = router;
