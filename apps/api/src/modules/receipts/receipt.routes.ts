import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import * as receiptController from "./receipt.controller";

const router = Router();

router.use(requireAuth);

router.get("/", receiptController.getReceipts);
router.get("/by-payment/:paymentId", receiptController.getReceiptByPayment);
router.get("/:id", receiptController.getReceipt);

export default router;
