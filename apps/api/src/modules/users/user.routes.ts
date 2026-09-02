import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import * as userController from "./user.controller";
import { createUserSchema, updateUserSchema } from "./user.schema";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/", userController.getUsers);
router.get("/:id", userController.getUser);
router.post("/", validateBody(createUserSchema), userController.createUser);
router.patch("/:id", validateBody(updateUserSchema), userController.updateUser);
router.delete("/:id", userController.deleteUser);

export default router;
