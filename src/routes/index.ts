import { Router } from "express";
import { AuthRoutes } from "../modules/Auth/auth.route";

const router = Router();


const routerManager = [
  {
    path: "/auth",
    route: AuthRoutes
  }
]

routerManager.forEach((r)=> router.use(r.path, r.route))


export default router