import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import * as membershipController from "./membership.controller";
import { createMembershipSchema, updateMembershipSchema } from "./membership.schema";

const router = Router();

router.use(requireAuth);

router.get("/", membershipController.getMemberships);
router.get("/:id", membershipController.getMembership);
router.post("/", validateBody(createMembershipSchema), membershipController.createMembership);
router.patch("/:id", validateBody(updateMembershipSchema), membershipController.updateMembership);
router.delete("/:id", membershipController.deleteMembership);

export default router;
