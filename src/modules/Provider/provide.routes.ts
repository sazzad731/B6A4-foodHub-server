import { Router } from "express";
import { providerController } from "./provider.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router()


router.get("/get-all", providerController.getAllProviders)


router.get("/:id", providerController.getProviderById)



router.post("/",auth(UserRole.PROVIDER), providerController.createProvider)


export const providerRoute = router