import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import * as issueReportController from "./issue-report.controller";
import { createIssueReportSchema, updateIssueReportSchema } from "./issue-report.schema";

const router = Router();

// Public — no auth — must be registered before the requireAuth gate below.
router.get("/public", issueReportController.getPublicIssueReports);

router.use(requireAuth);

router.get("/", issueReportController.getIssueReports);
router.get("/:id", issueReportController.getIssueReport);
router.post("/", validateBody(createIssueReportSchema), issueReportController.createIssueReport);
router.patch("/:id", validateBody(updateIssueReportSchema), issueReportController.updateIssueReport);
router.delete("/:id", issueReportController.deleteIssueReport);

export default router;
