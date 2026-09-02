import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import * as authController from "./auth.controller";
import { loginSchema } from "./auth.schema";

const router = Router();

router.post("/login", validateBody(loginSchema), authController.login);
router.get("/me", requireAuth, authController.getCurrentUser);

export default router;
