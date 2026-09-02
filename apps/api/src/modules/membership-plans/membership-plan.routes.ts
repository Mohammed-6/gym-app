import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import * as membershipPlanController from "./membership-plan.controller";
import { createMembershipPlanSchema, updateMembershipPlanSchema } from "./membership-plan.schema";

const router = Router();

router.use(requireAuth);

router.get("/", membershipPlanController.getMembershipPlans);
router.get("/:id", membershipPlanController.getMembershipPlan);
router.post(
  "/",
  requireRole("admin"),
  validateBody(createMembershipPlanSchema),
  membershipPlanController.createMembershipPlan
);
router.patch(
  "/:id",
  requireRole("admin"),
  validateBody(updateMembershipPlanSchema),
  membershipPlanController.updateMembershipPlan
);
router.delete("/:id", requireRole("admin"), membershipPlanController.deleteMembershipPlan);

export default router;
