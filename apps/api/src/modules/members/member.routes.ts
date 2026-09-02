import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import { uploadPhoto } from "../../middleware/upload.middleware";
import * as memberController from "./member.controller";
import { createMemberSchema, importMembersSchema, updateMemberSchema } from "./member.schema";

const router = Router();

router.use(requireAuth);

router.get("/", memberController.getMembers);
router.get("/next-id", memberController.getNextMemberId);
router.get("/:id", memberController.getMember);
router.get("/:id/photo-url", memberController.getMemberPhotoUrl);
router.post("/", validateBody(createMemberSchema), memberController.createMember);
router.post("/import", validateBody(importMembersSchema), memberController.importMembers);
router.post("/:id/photo", uploadPhoto.single("photo"), memberController.uploadMemberPhoto);
router.patch("/:id", validateBody(updateMemberSchema), memberController.updateMember);
router.delete("/:id", memberController.deleteMember);

export default router;
