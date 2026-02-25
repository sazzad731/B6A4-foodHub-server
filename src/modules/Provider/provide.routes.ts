import { Router } from "express";
import { providerController } from "./provider.controller";

const router = Router()


router.get("/", providerController.getAllProviders)


router.get("/:id", providerController.getProviderById)


export const providerRoute = router