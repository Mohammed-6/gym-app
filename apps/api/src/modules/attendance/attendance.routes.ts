import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import * as attendanceController from "./attendance.controller";
import { checkInSchema } from "./attendance.schema";

const router = Router();

router.use(requireAuth);

router.get("/today/:memberId", attendanceController.getTodayAttendance);
router.post("/", validateBody(checkInSchema), attendanceController.checkIn);

export default router;
