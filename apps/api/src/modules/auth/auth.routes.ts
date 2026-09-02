import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import * as authController from "./auth.controller";
import { bootstrapAdminSchema, changePasswordSchema, loginSchema } from "./auth.schema";

const router = Router();

router.post("/login", validateBody(loginSchema), authController.login);
router.post("/bootstrap-admin", validateBody(bootstrapAdminSchema), authController.bootstrapAdmin);
router.get("/me", requireAuth, authController.getCurrentUser);
router.patch("/change-password", requireAuth, validateBody(changePasswordSchema), authController.changePassword);

export default router;
