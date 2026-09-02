import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import branchRoutes from "../modules/branches/branch.routes";
import userRoutes from "../modules/users/user.routes";
import memberRoutes from "../modules/members/member.routes";
import membershipPlanRoutes from "../modules/membership-plans/membership-plan.routes";
import membershipRoutes from "../modules/memberships/membership.routes";
import paymentRoutes from "../modules/payments/payment.routes";
import receiptRoutes from "../modules/receipts/receipt.routes";
import dashboardRoutes from "../modules/dashboard/dashboard.routes";
import attendanceRoutes from "../modules/attendance/attendance.routes";
import settingsRoutes from "../modules/settings/settings.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/branches", branchRoutes);
router.use("/users", userRoutes);
router.use("/members", memberRoutes);
router.use("/membership-plans", membershipPlanRoutes);
router.use("/memberships", membershipRoutes);
router.use("/payments", paymentRoutes);
router.use("/receipts", receiptRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/settings", settingsRoutes);

export default router;
