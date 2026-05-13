import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { providerController } from "./provider.controller";

const router = Router();

router.get("/", providerController.getAllProviders);

router.get("/get-all", providerController.getAllProviders);

router.get("/dashboard", auth(UserRole.PROVIDER), providerController.getDashboard);

router.get("/:id", providerController.getProviderById);

router.post("/", auth(UserRole.PROVIDER), providerController.createProvider);

export const providerRoute = router;
