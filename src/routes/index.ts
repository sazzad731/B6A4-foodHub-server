import { Router } from "express";
import { AuthRoutes } from "../modules/Auth/auth.route";
import { mealsRoute } from "../modules/Meals/meals.routes";

const router = Router();


const routerManager = [
  {
    path: "/auth",
    route: AuthRoutes
  },
  {
    path: "/meals",
    route: mealsRoute
  }
]

routerManager.forEach((r)=> router.use(r.path, r.route))


export default router