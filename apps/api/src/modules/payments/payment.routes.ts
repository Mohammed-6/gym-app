import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import * as paymentController from "./payment.controller";
import { createPaymentSchema } from "./payment.schema";

const router = Router();

router.use(requireAuth);

router.get("/", paymentController.getPayments);
router.get("/:id", paymentController.getPayment);
router.post("/", validateBody(createPaymentSchema), paymentController.createPayment);

export default router;
