import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import * as settingsController from "./settings.controller";
import { updateSettingsSchema } from "./settings.schema";

const router = Router();

router.use(requireAuth);

router.get("/", settingsController.getSettings);
router.patch("/", requireRole("admin"), validateBody(updateSettingsSchema), settingsController.updateSettings);

export default router;
