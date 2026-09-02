import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import { uploadPhoto } from "../../middleware/upload.middleware";
import * as branchController from "./branch.controller";
import { createBranchSchema, updateBranchSchema } from "./branch.schema";

const router = Router();

router.use(requireAuth);

router.get("/", branchController.getBranches);
router.get("/:id", branchController.getBranch);
router.get("/:id/photo-url", branchController.getBranchPhotoUrl);
router.post("/", requireRole("admin"), validateBody(createBranchSchema), branchController.createBranch);
router.post("/:id/photo", requireRole("admin"), uploadPhoto.single("photo"), branchController.uploadBranchPhoto);
router.patch("/:id", requireRole("admin"), validateBody(updateBranchSchema), branchController.updateBranch);
router.delete("/:id", requireRole("admin"), branchController.deleteBranch);

export default router;
